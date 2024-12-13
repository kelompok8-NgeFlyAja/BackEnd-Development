const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { snap, core } = require("../../config/midtrans");

const createSnapPayment = async (req, res, next) => {
	try {
		const { bookingId } = req.params;
		const convertBookingId = parseInt(bookingId);
		let itemDetails = [];

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
				status: "Success",
				statusCode: "201",
				message: "Transaction successfully Created",
				token: midtransResponse,
			});
		}
	} catch (error) {
		console.log(error);
		next(error);
	}
};

module.exports = createSnapPayment;
