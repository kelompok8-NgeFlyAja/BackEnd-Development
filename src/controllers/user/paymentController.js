const crypto = require("crypto");
const moment = require('moment-timezone');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const midtrans = require("../../config/midtrans");
const randomGenerator = require("../../utils/randomGenerator");

const getFlightDetails = async (req, res, next) => {
	try {
		const flightDetails = await prisma.flights.findMany({
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

		const timeZone = 'Asia/Jakarta';
		const formattedFlightDetails = flightDetails.map((flight) => {
			const departureTimeConvert = moment.utc(flight.departureTime).tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
            const arrivalTimeConvert = moment.utc(flight.arrivalTime).tz(timeZone).format('YYYY-MM-DD HH:mm:ss');

			const convertDepartureTimeToDate = new Date(departureTimeConvert);
			
            const convertArrivalTimeToDate = new Date(arrivalTimeConvert);

			return {
				departureTime: convertDepartureTimeToDate.toLocaleTimeString(),
				departureDate: convertDepartureTimeToDate.toLocaleDateString(),
				departureAirportName: flight.route.departureAirport.name,
				planeName: flight.plane.planeName,
				seatClassName: flight.route.seatClass.name,
				planeCode: flight.plane.planeCode,
				description: flight.plane.description,
				baggage: flight.plane.baggage,
				cabinBaggage: flight.plane.cabinBaggage,
				arrivalTime: convertArrivalTimeToDate.toLocaleTimeString(),
				arrivalDate: convertArrivalTimeToDate.toLocaleDateString(),
				arrivalAirportName: flight.route.arrivalAirport.name,
				priceAdult: flight.route.seatClass.priceAdult,
				priceChild: flight.route.seatClass.priceChild,
				priceBaby: flight.route.seatClass.priceBaby,
			};
		});

		console.log(formattedFlightDetails, '-> From FormattedFlight');

		return formattedFlightDetails;
	} catch (error) {
		console.error("Error fetching flight details:", error);
		next(error);
	}
};

const createBooking = async (req, res, next) => {
	try {
		const passengerData = [];
		let { bookingTicket, passengerDetail } = req.body;
		const timeZone = 'Asia/Jakarta';

		if (!bookingTicket || !passengerDetail) {
			const error = new Errror("Make Sure To Fill All Forms!");
			error.status(400);
			throw error;
		}

		const randomCode = await randomGenerator();
		const BookingDateUtc7 = moment.utc(new Date()).tz(timeZone).format();

		const createdBooking = await prisma.bookings.create({
			data: {
				userId: bookingTicket.userId,
				flightId: bookingTicket.flightId,
				bookingCode: randomCode,
				bookingDate: BookingDateUtc7,
				status: bookingTicket.status,
				bookerName: bookingTicket.bookerName,
				bookerEmail: bookingTicket.bookerEmail,
				bookerPhone: bookingTicket.bookerPhone,
				totalPrice: bookingTicket.totalPrice,
			},
		});

		for (let i = 0; i < passengerDetail.length; i++) {
			const dateBirth = moment.utc(`${passengerDetail[i].birthDate}T00:00:00Z`).tz(timeZone).format();
			const dateExpired = moment.utc(`${passengerDetail[i].identityExpired}T00:00:00Z`).tz(timeZone).format();

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
			});
		}

		const createdPassengers = await prisma.passengers.createMany({
			data: passengerData
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

const createPayment = async (req, res, next) => {
	try {
		const { bookingId } = req.params;
		const convertBookingId = parseInt(bookingId);

		if (!bookingId) {
			const error = new Error("Booking Ticket ID is required");
			error.status = 400;
			throw error;
		}

		const booking = await prisma.bookings.findUnique({
			where: { id: convertBookingId },
			include: { passengers: true },
		});

		if (!booking) {
			const error = new Error("Booking Ticket not found");
			error.status = 404;
			throw error;
		}

		const changePrice = parseFloat(booking.totalPrice);
		const passengerPrice = changePrice / booking.passengers.length;

		const transactionDetails = {
			transaction_details: {
				order_id: booking.id,
				order_code: booking.bookingCode,
				gross_amount: changePrice,
			},
			customer_details: {
				first_name: booking.bookerName,
				phoneNumber: booking.bookerPhone,
				email: booking.bookerEmail,
			},
			item_details: booking.passengers.map((passengers) => ({
				id: passengers.identityNumber,
				price: passengerPrice,
				quantity: 1,
				name: passengers.fullName,
			})),
		};

		const midtransResponse = await midtrans.createTransaction(
			transactionDetails
		);
		console.log(bookingId);

		const newPayment = await prisma.payments.create({
			data: {
				booking: convertBookingId,
				paymentMethod: "Pending",
				amount: 0,
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

		const statusResponse = await midtrans.transaction.notification(
			notification
		);
		const { order_id, transaction_status, payment_type } = statusResponse;

		let newStatusPayment, newStatusBooking;
		switch (transaction_status) {
			case "settlement":
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

module.exports = { createBooking, createPayment, midtransNotification };
