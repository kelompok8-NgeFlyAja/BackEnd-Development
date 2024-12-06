const crypto = require("crypto");
const moment = require("moment-timezone");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {snap, core} = require("../../config/midtrans");
const randomGenerator = require("../../utils/randomGenerator");
const randomIdGenerator = require("../../utils/randomIdGenerator");

const getTicketDetails = async (req, res, next) => {
	try {
		const { flightId } = req.params;

		if (!flightId) {
			const error = new Error("Flight ID is required");
			error.status = 400;
			throw error;
		}

		const flightDetails = await prisma.flights.findUnique({
			where: { id: parseInt(flightId) },
			select: {
				departureTime: true,
				arrivalTime: true,
				route: {
					select: {
						departureAirport: {
							select: {
								name: true,
							},
						},
						arrivalAirport: {
							select: {
								name: true,
							},
						},
						seatClass: {
							select: {
								name: true,
								priceAdult: true,
								priceChild: true,
								priceBaby: true,
							},
						},
					},
				},
				plane: {
					select: {
						planeName: true,
						planeCode: true,
						description: true,
						baggage: true,
						cabinBaggage: true,
					},
				},
			},
		});

		if (!flightDetails) {
			const error = new Error("Flight not found");
			error.status = 400;
			throw error;
		}

		const timeZone = "Asia/Jakarta";
		const departureTimeConvert = moment
			.utc(flightDetails.departureTime)
			.tz(timeZone)
			.format("YYYY-MM-DD HH:mm:ss");
		const arrivalTimeConvert = moment
			.utc(flightDetails.arrivalTime)
			.tz(timeZone)
			.format("YYYY-MM-DD HH:mm:ss");

		const convertDepartureTimeToDate = new Date(departureTimeConvert);
		const convertArrivalTimeToDate = new Date(arrivalTimeConvert);

		return res.status(200).json({
			status: "Success",
			message: "Flight details retrieved successfully",
			data: {
				flightId: flightDetails.id,
				departureTime: convertDepartureTimeToDate.toLocaleTimeString(),
				departureDate: convertDepartureTimeToDate.toLocaleDateString(),
				departureAirportName: flightDetails.route.departureAirport.name,
				planeName: flightDetails.plane.planeName,
				seatClassName: flightDetails.route.seatClass.name,
				planeCode: flightDetails.plane.planeCode,
				description: flightDetails.plane.description,
				baggage: flightDetails.plane.baggage,
				cabinBaggage: flightDetails.plane.cabinBaggage,
				arrivalTime: convertArrivalTimeToDate.toLocaleTimeString(),
				arrivalDate: convertArrivalTimeToDate.toLocaleDateString(),
				arrivalAirportName: flightDetails.route.arrivalAirport.name,
				priceAdult: flightDetails.route.seatClass.priceAdult,
				priceChild: flightDetails.route.seatClass.priceChild,
				priceBaby: flightDetails.route.seatClass.priceBaby,
			},
		});
	} catch (error) {
		next(error);
	}
};

const createBooking = async (req, res, next) => {
	try {
		const passengerData = [];
		let {
			bookingTicket,
			passengerDetail,
			adultPassenger,
			childPassenger,
			babyPassenger,
		} = req.body;
		const timeZone = "Asia/Jakarta";

		if (!bookingTicket || !passengerDetail) {
			const error = new Errror("Make Sure To Fill All Forms!");
			error.status(400);
			throw error;
		}

		const randomCode = await randomGenerator();
		const randomId = await randomIdGenerator();
		const BookingDateUtc7 = moment.utc(new Date()).tz(timeZone).format();

		const createdBooking = await prisma.bookings.create({
			data: {
				id: parseInt(randomId),
				userId: bookingTicket.userId,
				flightId: bookingTicket.flightId,
				bookingCode: randomCode,
				bookingDate: BookingDateUtc7,
				adultPassenger: adultPassenger,
				childPassenger: childPassenger,
				babyPassenger: babyPassenger,
				status: "PENDING",
				bookerName: bookingTicket.bookerName,
				bookerEmail: bookingTicket.bookerEmail,
				bookerPhone: bookingTicket.bookerPhone,
				totalPrice: 0,
			},
		});

		const seatClassInfo = await prisma.flights.findUnique({
			where: { id: bookingTicket.flightId },
			include: {
				route: {
					include: {
						seatClass: true,
					},
				},
			},
		});

		if (!seatClassInfo) {
			const error = new Error("Seat Class Not Found");
			error.status = 400;
			throw error;
		}

		const seatClass = seatClassInfo.route.seatClass;

		const totalAdultPrice = seatClass.priceAdult * adultPassenger;
		const totalChildPrice = seatClass.priceChild * childPassenger;
		const totalBabyPrice = seatClass.priceBaby * babyPassenger;
		const totalPrice = totalAdultPrice + totalChildPrice + totalBabyPrice;

		await prisma.bookings.update({
			where: { id: createdBooking.id },
			data: { totalPrice: totalPrice },
		});

		const planeInfo = await prisma.flights.findUnique({
			where: { id: bookingTicket.flightId },
			select: { planeId: true },
		});

		if (!planeInfo) {
			const error = new Error("Plane Not Found");
			error.status = 400;
			throw error;
		}

		const planeId = planeInfo.planeId;

		for (let i = 0; i < passengerDetail.length; i++) {
			const dateBirth = moment
				.utc(`${passengerDetail[i].birthDate}T00:00:00Z`)
				.tz(timeZone)
				.format();
			const dateExpired = moment
				.utc(`${passengerDetail[i].identityExpired}T00:00:00Z`)
				.tz(timeZone)
				.format();

			const selectedSeatName = passengerDetail[i].seatName;

			const selectedSeat = await prisma.seats.findFirst({
				where: {
					seatNumber: selectedSeatName,
					planeId: planeId,
				},
			});

			if (!selectedSeat) {
				throw new Error(`No available seat for passenger ${i + 1}`);
			}

			if (!selectedSeat.isAvailable) {
				throw new Error(`Seat ${selectedSeatName} is already taken.`);
			}

			await prisma.seats.update({
				where: { id: selectedSeat.id },
				data: { isAvailable: false },
			});

			passengerData.push({
				bookingId: createdBooking.id,
				title: passengerDetail[i].title,
				fullName: passengerDetail[i].fullName,
				familyName: passengerDetail[i].familyName,
				birthDate: dateBirth,
				nationality: passengerDetail[i].nationality,
				identityNumber: passengerDetail[i].identityNumber,
				identityCountry: passengerDetail[i].identityCountry,
				identityExpired: dateExpired,
				seatId: selectedSeat.id,
			});
		}

		const createdPassengers = await prisma.passengers.createMany({
			data: passengerData,
		});

		if (createdBooking && createdPassengers) {
			res.status(200).json({
				status: "Success",
				message: "Booking Successfully Created",
				bookingId: createdBooking.id,
				bookingCode: createdBooking.bookingCode,
			});
		}
	} catch (error) {
		next(error);
	}
};

const createSnapPayment = async (req, res, next) => {
	try {
		const { bookingId } = req.params;
		const convertBookingId = parseInt(bookingId);
		let itemDetails = [];

		if (!bookingId) {
			const error = new Error("Booking Ticket ID is required");
			error.status = 400;
			throw error;
		}

		const booking = await prisma.bookings.findUnique({
			where: { id: convertBookingId },
			include: {
				passengers: true,
				flight: {
					include: {
						route: {
							include: {
								departureAirport: true,
								arrivalAirport: true,
								seatClass: true,
							},
						},
					},
				},
			},
		});

		const seatClass = booking.flight.route.seatClass;

		if (!booking) {
			const error = new Error("Booking Ticket not found");
			error.status = 400;
			throw error;
		}

		if (booking.adultPassenger > 0) {
			itemDetails.push({
				id: `adult-passenger`,
				price: seatClass.priceAdult,
				quantity: booking.adultPassenger,
				name: `Adult Passenger`,
				seat_class: seatClass.name,
			});
		}
		if (booking.childPassenger > 0) {
			itemDetails.push({
				id: `child-passenger`,
				price: seatClass.priceChild,
				quantity: booking.childPassenger,
				name: `Adult Passenger`,
			});
		}
		if (booking.babyPassenger > 0) {
			itemDetails.push({
				id: `baby-passenger`,
				price: seatClass.priceBaby,
				quantity: booking.babyPassenger,
				name: `Baby Passenger`,
			});
		}

		const totalPrice = itemDetails.reduce((sum, item) => {
			return sum + item.price * item.quantity;
		}, 0);

		const transactionDetails = {
			transaction_details: {
				order_id: booking.id,
				order_code: booking.bookingCode,
				gross_amount: totalPrice,
			},
			customer_details: {
				first_name: `Booker: ${booking.bookerName}`,
				phone: booking.bookerPhone,
				billing_address: {
					address: `Email: ${booking.bookerEmail}`,
				},
			},
			item_details: itemDetails,
		};

		const midtransResponse = await snap.createTransaction(
			transactionDetails
		);

		const newPayment = await prisma.payments.create({
			data: {
				booking: convertBookingId,
				paymentMethod: "Pending",
				amount: totalPrice,
				expiredDate: new Date(Date.now() + 60 * 60 * 1000),
				status: "Unpaid",
				booking: {
					connect: { id: convertBookingId },
				},
			},
		});

		if (newPayment) {
			return res.status(200).json({
				message: "Transaction created successfully",
				token: midtransResponse,
			});
		}
	} catch (error) {
		console.log(error);
		next(error);
	}
};

const createCCPayment = async (req, res, next) => {
	try {
		const { bookingId } = req.params;
		const { card_number, card_exp_month, card_exp_year, card_cvv } = req.body;
		const convertBookingId = parseInt(bookingId);
		let itemDetails = [];

		if (!card_number || !card_exp_month || !card_exp_year || !card_cvv) {
            const error = new Error("Card details are required");
            error.statusCode = 400;
            throw error;
        }

		if (isNaN(card_number) || card_number.length !== 16) {
            const error = new Error("Invalid card_number. It should be a 16-digit number.");
            error.statusCode = 400;
            throw error;
        }

		if (isNaN(card_exp_month) || card_exp_month < 1 || card_exp_month > 12) {
            const error = new Error("Invalid card_exp_month. It should be a number between 1 and 12.");
            error.statusCode = 400;
            throw error;
        }

		if (isNaN(card_exp_year) || card_exp_year < new Date().getFullYear()) {
            const error = new Error("Invalid card_exp_year. It should be a valid year.");
            error.statusCode = 400;
            throw error;
        }

		if (isNaN(card_cvv) || card_cvv.length !== 3) {
            const error = new Error("Invalid card_cvv. It should be a 3-digit number.");
            error.statusCode = 400;
            throw error;
        }

		if (!bookingId) {
			const error = new Error("Booking Ticket ID is required");
			error.statusCode = 400;
			throw error;
		}

		const booking = await prisma.bookings.findUnique({
			where: { id: convertBookingId },
			include: {
				passengers: true,
				flight: {
					include: {
						route: {
							include: {
								departureAirport: true,
								arrivalAirport: true,
								seatClass: true,
							},
						},
					},
				},
			},
		});

		const seatClass = booking.flight.route.seatClass;

		if (!booking) {
			const error = new Error("Booking Ticket not found");
			error.status = 400;
			throw error;
		}

		if (booking.adultPassenger > 0) {
			itemDetails.push({
				id: `adult-passenger`,
				price: seatClass.priceAdult,
				quantity: booking.adultPassenger,
				name: `Adult Passenger`,
				seat_class: seatClass.name,
			});
		}
		if (booking.childPassenger > 0) {
			itemDetails.push({
				id: `child-passenger`,
				price: seatClass.priceChild,
				quantity: booking.childPassenger,
				name: `Child Passenger`,
			});
		}
		if (booking.babyPassenger > 0) {
			itemDetails.push({
				id: `baby-passenger`,
				price: seatClass.priceBaby,
				quantity: booking.babyPassenger,
				name: `Baby Passenger`,
			});
		}

		const totalPrice = itemDetails.reduce((sum, item) => {
			return sum + item.price * item.quantity;
		}, 0);

		const cardData = {
            card_number,
            card_exp_month,
            card_exp_year,
            card_cvv,
			client_key: process.env.MIDTRANS_CLIENT_KEY
        };

		const tokenResponse = await core.cardToken(cardData);

		const transactionDetails = {
			payment_type: "credit_card",
			transaction_details: {
				order_id: booking.id,
				gross_amount: totalPrice,
			},
			customer_details: {
				first_name: `Booker: ${booking.bookerName}`,
				phone: booking.bookerPhone,
				billing_address: {
					address: `Email: ${booking.bookerEmail}`,
				},
			},
			item_details: itemDetails,
			credit_card: {
				token_id: tokenResponse.token_id,
				secure: true,
			},
		};

		const midtransResponse = await core.charge(transactionDetails);

		if (midtransResponse) {
			const newPayment = await prisma.payments.create({
				data: {
					booking: convertBookingId,
					paymentMethod: "Credit Card",
					amount: totalPrice,
					expiredDate: new Date(Date.now() + 60 * 60 * 1000),
					status: "Unpaid",
					booking: {
						connect: { id: convertBookingId },
					},
				},
			});

			if (newPayment) {
				return res.status(201).json({
					status: "success",
					statusCode: 201,
					message: "Payment created successfully, Please Wait For A Minute!",
					token: midtransResponse
				});
			}
		}
	} catch (error) {
		if (error.httpStatusCode === '406') {
            const err = new Error('Failed to create payment because of its already been created! Please Make A new Booking');
            err.statusCode = 406;
            return next(err); 
        }

		next(error);
	}
};

const midtransNotification = async (req, res, next) => {
	try {
		const notification = req.body;
		const serverKey = process.env.MIDTRANS_SERVER_KEY;

		const orderId = notification.order_id;
		const statusCode = notification.status_code;
		const grossAmount = notification.gross_amount;

		const payload = orderId + statusCode + grossAmount + serverKey;
		const signature = crypto
			.createHash("sha512")
			.update(payload)
			.digest("hex");

		if (signature !== notification.signature_key) {
			console.log("Invalid Midtrans signature!");
			return res.status(400).send("Invalid signature");
		}

		console.log("Valid notification received:", notification);

		const statusResponse = await core.transaction.notification(
			notification
		);
		const { order_id, transaction_status, payment_type } = statusResponse;

		let newStatusPayment, newStatusBooking;
		switch (transaction_status) {
			case "settlement":
				newStatusPayment = "Issued";
				newStatusBooking = "SUCCESS";
				break;
			case "capture":
				newStatusPayment = "Issued";
				newStatusBooking = "SUCCESS";
				break;
			case "pending":
				newStatusPayment = "Unpaid";
				newStatusBooking = "PENDING";
				break;
			case "cancel":
				newStatusPayment = "Cancelled";
				newStatusBooking = "CANCEL";
				break;
			case "expire":
				newStatusPayment = "Cancelled";
				newStatusBooking = "CANCEL";
				break;
			default:
				newStatusPayment = "Error";
				newStatusBooking = "Error";
		}

		await prisma.bookings.update({
			where: { id: parseInt(order_id) },
			data: {
				status: newStatusBooking,
			},
		});
		await prisma.payments.update({
			where: { bookingId: parseInt(order_id) },
			data: {
				paymentMethod: payment_type,
				status: newStatusPayment,
			},
		});

		res.status(200).json({ message: "Payment status updated" });
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createBooking,
	createSnapPayment,
	createCCPayment,
	midtransNotification,
	getTicketDetails,
};
