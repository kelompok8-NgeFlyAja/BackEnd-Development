const moment = require("moment-timezone");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const randomGenerator = require("../../utils/randomGenerator");
const randomIdGenerator = require("../../utils/randomIdGenerator");

const getTicketDetails = async (req, res, next) => {
	try {
		const { flightId, ap, cp, bp } = req.query;

		if (!flightId) {
			const error = new Error("Flight ID is required");
			error.statusCode = 400;
			throw error;
		}

		const flightDetails = await prisma.flights.findUnique({
			where: { id: parseInt(flightId) },
			select: {
				id: true,
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
			error.statusCode = 404;
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

		const totalAdultPrice = flightDetails.route.seatClass.priceAdult * ap;
		const totalChildPrice = flightDetails.route.seatClass.priceChild * cp;
		const totalBabyPrice = flightDetails.route.seatClass.priceBaby * bp;
		
		const totalPassengers = ap + cp + bp
		let taxFlight;
		
		if (totalPassengers >= 1 && totalPassengers <= 2) {
			taxFlight = 30000;
        } else if (totalPassengers >= 3 && totalPassengers <= 5) {
			taxFlight = 50000;
        } else if (totalPassengers >= 6 && totalPassengers <= 8) {
			taxFlight = 100000;
        } else if (totalPassengers > 8) {
			taxFlight = 125000;
        } else {
			taxFlight = 0;
        }
		const totalPrice = totalAdultPrice + totalChildPrice + totalBabyPrice + taxFlight

		res.status(200).json({
			status: "Success",
			statusCode: 200,
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
				priceAdult: totalAdultPrice,
				priceChild: totalChildPrice,
				priceBaby: totalBabyPrice,
				total: totalPrice,
				tax: taxFlight
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

		if (
			!bookingTicket ||
			!passengerDetail ||
			!bookingTicket.flightId ||
			!bookingTicket.bookerName ||
			!bookingTicket.bookerEmail ||
			!bookingTicket.bookerPhone ||
			passengerDetail.length === 0
		) {
			const error = new Error("Make Sure To Fill All The Booker Forms!");
			error.statusCode = 400;
			throw error;
		}

		for (let i = 0; i < passengerDetail.length; i++) {
			if (
				!passengerDetail[i].title ||
				!passengerDetail[i].fullName ||
				!passengerDetail[i].birthDate ||
				!passengerDetail[i].nationality ||
				!passengerDetail[i].identityNumber ||
				!passengerDetail[i].identityCountry ||
				!passengerDetail[i].identityExpired ||
				!passengerDetail[i].seatName
			) {
				const error = new Error(
					"Make Sure To Fill All The Passenger Forms!"
				);
				error.statusCode = 400;
				throw error;
			}
		}

		if (
			!Number.isInteger(adultPassenger) ||
			!Number.isInteger(childPassenger) ||
			!Number.isInteger(babyPassenger)
		) {
			const error = new Error("Passenger counts must be Number!");
			error.statusCode = 400;
			throw error;
		}
		const totalPassengers = adultPassenger + childPassenger + babyPassenger;
		if (totalPassengers !== passengerDetail.length) {
			const error = new Error(
				"The total of passenger details does not match the number of passengers provided!"
			);
			error.statusCode = 400;
			throw error;
		}

		const planeInfo = await prisma.flights.findUnique({
			where: { id: bookingTicket.flightId },
			select: { planeId: true },
		});

		if (!planeInfo) {
			const error = new Error("Plane Not Found");
			error.statusCode = 400;
			throw error;
		}

		const planeId = planeInfo.planeId;

		for (let i = 0; i < passengerDetail.length; i++) {
			const selectedSeatName = passengerDetail[i].seatName;
			const selectedSeat = await prisma.seats.findFirst({
				where: {
					seatNumber: selectedSeatName,
					planeId: planeId,
				},
			});

			if (!selectedSeat) {
				const error = new Error(
					`No available seat for passenger ${i + 1}`
				);
				error.statusCode = 400;
				throw error;
			}

			if (!selectedSeat.isAvailable) {
				const error = new Error(
					`Seat ${selectedSeatName} is already taken`
				);
				error.statusCode = 400;
				throw error;
			}

			await prisma.seats.update({
				where: { id: selectedSeat.id },
				data: { isAvailable: false },
			});

			const dateBirth = moment
				.utc(`${passengerDetail[i].birthDate}T00:00:00Z`)
				.tz(timeZone)
				.format();
			const dateExpired = moment
				.utc(`${passengerDetail[i].identityExpired}T00:00:00Z`)
				.tz(timeZone)
				.format();

			passengerData.push({
				bookingId: null,
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

		const randomCode = await randomGenerator();
		const randomId = await randomIdGenerator();
		const BookingDateUtc7 = moment.utc(new Date()).tz(timeZone).format();
		let taxFlight;
		
		if (totalPassengers >= 1 && totalPassengers <= 2) {
            taxFlight = 30000;
        } else if (totalPassengers >= 3 && totalPassengers <= 5) {
            taxFlight = 50000;
        } else if (totalPassengers >= 6 && totalPassengers <= 8) {
            taxFlight = 100000;
        } else if (totalPassengers > 8) {
            taxFlight = 125000;
        } else {
            taxFlight = 0;
        }

		const createdBooking = await prisma.bookings.create({
			data: {
				id: parseInt(randomId),
				userId: req.user.id,
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
				tax: taxFlight
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
			error.statusCode = 400;
			throw error;
		}

		const seatClass = seatClassInfo.route.seatClass;

		const totalAdultPrice = seatClass.priceAdult * adultPassenger;
		const totalChildPrice = seatClass.priceChild * childPassenger;
		const totalBabyPrice = seatClass.priceBaby * babyPassenger;
		const totalPrice = totalAdultPrice + totalChildPrice + totalBabyPrice + taxFlight;

		await prisma.bookings.update({
			where: { id: createdBooking.id },
			data: { totalPrice: totalPrice},
		});

		for (let i = 0; i < passengerData.length; i++) {
			passengerData[i].bookingId = createdBooking.id;
		}

		const createdPassengers = await prisma.passengers.createMany({
			data: passengerData,
		});

		if (createdBooking && createdPassengers) {
			res.status(201).json({
				status: "Success",
				statusCode: 201,
				message: "Booking Successfully Created",
				bookingId: createdBooking.id,
				bookingCode: createdBooking.bookingCode,
			});
		}
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createBooking,
	getTicketDetails,
};
