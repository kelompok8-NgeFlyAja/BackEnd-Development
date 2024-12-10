const crypto = require("crypto");
const moment = require("moment-timezone");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { snap, core } = require("../../config/midtrans");
const {
	mandiriDetail,
	bcaDetail,
	bniDetail,
	briDetail,
} = require("../../utils/paymentProcessor");

const createCCPayment = async (req, res, next) => {
	try {
		const { bookingId } = req.params;
		const { card_number, card_exp_month, card_exp_year, card_cvv } =
			req.body;
		const convertBookingId = parseInt(bookingId);
		let itemDetails = [];

		if (!card_number || !card_exp_month || !card_exp_year || !card_cvv) {
			const error = new Error("Card details are required");
			error.statusCode = 400;
			throw error;
		}

		if (isNaN(card_number) || card_number.length !== 16) {
			const error = new Error(
				"Invalid card_number. It should be a 16-digit number."
			);
			error.statusCode = 400;
			throw error;
		}

		if (
			isNaN(card_exp_month) ||
			card_exp_month < 1 ||
			card_exp_month > 12
		) {
			const error = new Error(
				"Invalid card_exp_month. It should be a number between 1 and 12."
			);
			error.statusCode = 400;
			throw error;
		}

		if (isNaN(card_exp_year) || card_exp_year < new Date().getFullYear()) {
			const error = new Error(
				"Invalid card_exp_year. It should be a valid year."
			);
			error.statusCode = 400;
			throw error;
		}

		if (isNaN(card_cvv) || card_cvv.length !== 3) {
			const error = new Error(
				"Invalid card_cvv. It should be a 3-digit number."
			);
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
			error.statusCode = 400;
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
			client_key: process.env.MIDTRANS_CLIENT_KEY,
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
					message:
						"Payment created successfully, Please Wait For A Minute!",
					token: midtransResponse,
				});
			}
		}
	} catch (error) {
		if (error.httpStatusCode === "406") {
			const err = new Error(
				"Failed to create payment because of its already been created! Please Make A new Booking"
			);
			err.statusCode = 406;
			return next(err);
		}

		next(error);
	}
};

const createVAPayment = async (req, res, next) => {
	try {
		// const { bookingId, bank } = req.params;
		const { bookingId } = req.params;
		const convertBookingId = parseInt(bookingId);
		let itemDetails = [];

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
			error.statusCode = 400;
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

		const banks = ["mandiri", "bca", "bni", "bri"];
		const responses = [];

		for (let bank of banks) {
			let midtransResponse;
			switch (bank) {
				case "mandiri":
					midtransResponse = await mandiriDetail(
						booking,
						itemDetails,
						totalPrice
					);
					break;
				case "bca":
					midtransResponse = await bcaDetail(
						booking,
						itemDetails,
						totalPrice
					);
					break;
				case "bni":
					midtransResponse = await bniDetail(
						booking,
						itemDetails,
						totalPrice
					);
					break;
				case "bri":
					midtransResponse = await briDetail(
						booking,
						itemDetails,
						totalPrice
					);
					break;
				default:
					const error = new Error("Bank not supported");
					error.statusCode = 400;
					throw error;
			}

			if (midtransResponse) {
				if (midtransResponse.payment_type === 'bank_transfer') {
					responses.push({
						bank: bank,
						vaNumber: midtransResponse.va_numbers[0].va_number
					});
				} else {
					responses.push({
						bank: bank,
						vaCode: midtransResponse.biller_code,
						vaNumber: midtransResponse.bill_key,
					});
				}
			}
		}

		if (responses.length > 0) {
			const newPayment = await prisma.payments.create({
				data: {
					booking: convertBookingId,
					paymentMethod: "Virtual Account	",
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
					message:
						"Payment created successfully, Please use the VA Number below to pay!",
					bankDetails: responses,
				});
			}
		}

		// let midtransResponse;
		// if (bank === "mandiri") {
		// 	midtransResponse = await mandiriDetail(booking, itemDetails, totalPrice);
		// } else if (bank === "bca") {
		// 	midtransResponse = await bcaDetail(booking, itemDetails, totalPrice);
		// } else if (bank === "bni") {
		// 	midtransResponse = await bniDetail(booking, itemDetails, totalPrice);
		// } else if (bank === "bri") {
		// 	midtransResponse = await briDetail(booking, itemDetails, totalPrice);
		// } else {
		// 	const error = new Error("Bank not supported");
		// 	error.statusCode = 400;
		// 	throw error;
		// }

		// if (midtransResponse) {
		// 	const newPayment = await prisma.payments.create({
		// 		data: {
		// 			booking: convertBookingId,
		// 			paymentMethod: "Credit Card",
		// 			amount: totalPrice,
		// 			expiredDate: new Date(Date.now() + 60 * 60 * 1000),
		// 			status: "Unpaid",
		// 			booking: {
		// 				connect: { id: convertBookingId },
		// 			},
		// 		},
		// 	});

		// 	if (newPayment) {
		// 		return res.status(201).json({
		// 			status: "success",
		// 			statusCode: 201,
		// 			message:
		// 				"Payment created successfully, Please Use The VA Number Below To Pay!",
		// 			vaCode: midtransResponse.biller_code,
		// 			vaNumber: midtransResponse.bill_key,
		// 		});
		// 	}
		// }
	} catch (error) {
		if (error.httpStatusCode === "406") {
			const err = new Error(
				"Failed to create payment because of its already been created! Please Make A new Booking"
			);
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
			const error = new Error(
				"Midtrans Error: Signature's not The Same!"
			);
			error.statusCode = 400;
			throw error;
		}

		const statusResponse = await core.transaction.notification(
			notification
		);
		const { order_id, transaction_status, payment_type } = statusResponse;
		const bookingId = order_id.split('-')[0];
		const listBank = [`${bookingId}-mandiri`, `${bookingId}-bca`, `${bookingId}-bri`, `${bookingId}-bni`,]

		let newStatusPayment, newStatusBooking;

		if (transaction_status === 'settlement' || transaction_status === 'capture') {
			for (let orderId of listBank) {
				if (orderId !== order_id) {
					await core.transaction.cancel({order_id: orderId});
					console.log(`Cancelled other transaction: ${orderId}`);
				}
			}

			await prisma.bookings.update({
				where: { id: parseInt(bookingId) },
				data: {
					status: newStatusBooking,
				},
			});
			await prisma.payments.update({
				where: { bookingId: parseInt(bookingId) },
				data: {
					paymentMethod: payment_type,
					status: newStatusPayment,
				},
			});
		}

		// switch (transaction_status) {
		// 	case "settlement":
		// 		newStatusPayment = "Issued";
		// 		newStatusBooking = "SUCCESS";
		// 		break;
		// 	case "capture":
		// 		newStatusPayment = "Issued";
		// 		newStatusBooking = "SUCCESS";
		// 		break;
		// 	case "pending":
		// 		newStatusPayment = "Unpaid";
		// 		newStatusBooking = "PENDING";
		// 		break;
		// 	case "cancel":
		// 		newStatusPayment = "Cancelled";
		// 		newStatusBooking = "CANCEL";
		// 		break;
		// 	case "expire":
		// 		newStatusPayment = "Cancelled";
		// 		newStatusBooking = "CANCEL";
		// 		break;
		// 	default:
		// 		newStatusPayment = "Error";
		// 		newStatusBooking = "Error";
		// }

		await prisma.bookings.update({
			where: { id: parseInt(bookingId) },
			data: {
				status: newStatusBooking,
			},
		});
		await prisma.payments.update({
			where: { bookingId: parseInt(bookingId) },
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
	createCCPayment,
	createVAPayment,
	midtransNotification,
};