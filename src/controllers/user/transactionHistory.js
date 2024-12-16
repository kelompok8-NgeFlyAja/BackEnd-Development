const moment = require("moment-timezone");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getTransactionHistory = async (req, res, next) => {
	try {
		const userId = req.user.id;

		const userBookings = await prisma.bookings.findMany({
			where: { userId: parseInt(userId) },
			include: {
				flight: {
					include: {
						route: {
							include: {
								departureAirport: true,
								arrivalAirport: true,
								seatClass: true,
							},
						},
						plane: true,
					},
				},
				passengers: true,
				payments: true,
			},
		});

		const history = userBookings.map((booking) => {
			const flightDetails = booking.flight;
			const route = flightDetails.route;
			const plane = flightDetails.plane;
			const seatClass = route.seatClass;

			let priceAdult = seatClass.priceAdult * booking.adultPassenger;
			let priceChild = seatClass.priceChild * booking.childPassenger;
			let priceBaby = seatClass.priceBaby * booking.babyPassenger;
			let totalPrice = priceAdult + priceChild + priceBaby;

			const convertDepartureTimeToDate = new Date(
				flightDetails.departureTime
			);
			const convertArrivalTimeToDate = new Date(
				flightDetails.arrivalTime
			);

			return {
				status: booking.status,
				bookingId: booking.id,
				bookingCode: booking.bookingCode,
				flightId: flightDetails.id,
				flightCode: flightDetails.flightCode,
				departureTime: convertDepartureTimeToDate.toLocaleTimeString(),
				departureDate: convertDepartureTimeToDate.toLocaleDateString(),
				departureAirportName: route.departureAirport.name,
				planeName: plane.planeName,
				seatClassName: seatClass.name,
				planeCode: plane.planeCode,
				description: plane.description,
				baggage: plane.baggage,
				cabinBaggage: plane.cabinBaggage,
				arrivalTime: convertArrivalTimeToDate.toLocaleTimeString(),
				arrivalDate: convertArrivalTimeToDate.toLocaleDateString(),
				arrivalAirportName: route.arrivalAirport.name,
				priceAdult: priceAdult,
				priceChild: priceChild,
				priceBaby: priceBaby,
				totalPrice: totalPrice,
			};
		});

		res.status(200).json({
			status: "Success",
			statusCode: 200,
			message: "Flight transaction history retrieved successfully",
			data: history,
		});
	} catch (error) {
		next(error)
	}
}

module.exports = getTransactionHistory