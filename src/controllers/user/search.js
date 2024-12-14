const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const moment = require("moment-timezone");

const searchFlights = async (req, res, next) => {
    try {
        const { departureAirportCode, arrivalAirportCode, departureTime, seatClasses, adultPassenger, childPassenger, babyPassenger, returnTime = 'null', page = 1, pageSize = 10 } = req.query;
        // let returnTime = req.query.returnTime || null;
        console.log({ departureAirportCode, arrivalAirportCode, departureTime, returnTime, seatClasses, adultPassenger, childPassenger, babyPassenger, returnTime, page, pageSize });
        // if (!returnTime) {
        //     returnTime = null;
        // }

        if (!departureAirportCode || !arrivalAirportCode || !departureTime || !seatClasses || !adultPassenger || !childPassenger || !babyPassenger) {
            const error = new Error("Please provide all required fields");
            error.status = 400;
            throw error;
        }

        if (typeof departureAirportCode !== 'string' || typeof arrivalAirportCode !== 'string' || typeof seatClasses !== "string" || isNaN(adultPassenger) || isNaN(childPassenger) || isNaN(babyPassenger)) {
            const error = new Error("Invalid input data");
            error.status = 400;
            throw error;
        }

        const departureAirportCodeLower = departureAirportCode.toLowerCase();
        const arrivalAirportCodeLower = arrivalAirportCode.toLowerCase();
        const seatClassesLower = seatClasses.toLowerCase();
        const totalPassengers = parseInt(adultPassenger) + parseInt(childPassenger) + parseInt(babyPassenger);

        const parsedDate = new Date(departureTime);
        if (isNaN(parsedDate)) {
            const error = new Error("Invalid date format");
            error.status = 400;
            throw error;
        }

        const departureAirport = await prisma.airports.findMany({
            where: {
                airportCode: {
                    equals: departureAirportCodeLower,
                    mode: 'insensitive',
                }
            }
        });

        // console.log('departureAirport', departureAirport);

        if (!departureAirport || departureAirport.length === 0) {
            const error = new Error("Airport not found");
            error.status = 404;
            throw error;
        }

        const arrivalAirport = await prisma.airports.findMany({
            where: {
                airportCode: {
                    equals: arrivalAirportCodeLower,
                    mode: 'insensitive',
                }
            }
        });

        // console.log('arrivalAirport', arrivalAirport);

        if (!arrivalAirport || arrivalAirport.length === 0) {
            const error = new Error("Airport not found");
            error.status = 404;
            throw error;
        }

        const pageNumber = parseInt(page);
        const itemsPerPage = parseInt(pageSize);
        const offset = (pageNumber - 1) * itemsPerPage;
        const flights = await prisma.flights.findMany({
            where: {
                route: {
                    departureAirport: departureAirport.id,
                    arrivalAirport: arrivalAirport.id,
                    seatClass: {
                        name: {
                            equals: seatClassesLower,
                            mode: 'insensitive',
                        },
                    },
                },
                departureTime: {
                    gte: new Date(parsedDate.setHours(0, 0, 0)), // Mulai hari
                    lt: new Date(parsedDate.setHours(23, 59, 59)), // Akhir hari
                },
            },
            include: {
                route: {
                    include: {
                        seatClass: true,
                    },
                },
                plane: {
                    include: {
                        seats: true,
                    },
                },
            },
            skip: offset,
            take: itemsPerPage
        });


        const availableFlights = flights.filter((flight) => {
            const availableSeats = flight.plane.seats.filter((seat) => seat.isAvailable).length;
            // console.log(`Seat tersedia: ${availableSeats}`);
            return availableSeats >= parseInt(totalPassengers);
        });

        if (availableFlights.length === 0) {
            const error = new Error("No flights available for the given criteria");
            error.status = 404;
            throw error;
        }

        const availableFlightsResponse = availableFlights.map((flight) => {
            const timeZone = "Asia/Jakarta";
            const departureTimeConvert = moment
                .utc(flight.departureTime)
                .tz(timeZone)
                .format("YYYY-MM-DD HH:mm:ss");
            const arrivalTimeConvert = moment
                .utc(flight.arrivalTime)
                .tz(timeZone)
                .format("YYYY-MM-DD HH:mm:ss");

            const convertDepartureTimeToDate = new Date(departureTimeConvert);
            const convertArrivalTimeToDate = new Date(arrivalTimeConvert);
            return {
                flightId: flight.id,
                departureAirport: departureAirportCode,
                arrivalAirport: arrivalAirportCode,
                departureTime: convertDepartureTimeToDate.toLocaleTimeString(),
                departureDate: convertDepartureTimeToDate.toLocaleDateString(),
                arrivalTime: convertArrivalTimeToDate.toLocaleTimeString(),
                arrivalDate: convertArrivalTimeToDate.toLocaleDateString(),
                flightCode: flight.flightCode,
                duration: flight.duration,
                route: {
                    routeId: flight.route.id,
                    departureAirport: departureAirportCode,
                    arrivalAirport: arrivalAirportCode,
                    seatClass: seatClasses,
                },
                plane: {
                    planeId: flight.plane.id,
                    planeName: flight.plane.name,
                    planeCode: flight.plane.planeCode,
                    description: flight.plane.description,
                    baggage: flight.plane.baggage,
                    cabinBaggage: flight.plane.cabinBaggage,
                },
                price: flight.route.seatClass.priceAdult
            };
        });

        const availableReturnFlights = flights.filter((flight) => {
            const availableSeats = flight.plane.seats.filter((seat) => seat.isAvailable).length;
            // console.log(`Seat return tersedia: ${availableSeats}`);
            return availableSeats >= totalPassengers;
        });

        if (availableReturnFlights.length === 0) {
            const error = new Error("No return flights available for the given criteria");
            error.status = 404;
            throw error;
        }

        const availableReturnFlightsResponse = availableReturnFlights.map((flight) => {
            const timeZone = "Asia/Jakarta";
            const returnTimeConvert = moment
                .utc(flight.returnTime)
                .tz(timeZone)
                .format("YYYY-MM-DD HH:mm:ss");
            const arrivalTimeConvert = moment
                .utc(flight.arrivalTime)
                .tz(timeZone)
                .format("YYYY-MM-DD HH:mm:ss");

            const convertreturnTimeToDate = new Date(returnTimeConvert);
            const convertArrivalTimeToDate = new Date(arrivalTimeConvert);
            return {
                flightId: flight.id,
                departureAirport: departureAirportCode,
                arrivalAirport: arrivalAirportCode,
                departureTime: convertreturnTimeToDate.toLocaleTimeString(),
                departureDate: convertreturnTimeToDate.toLocaleDateString(),
                arrivalTime: convertArrivalTimeToDate.toLocaleTimeString(),
                arrivalDate: convertArrivalTimeToDate.toLocaleDateString(),
                flightCode: flight.flightCode,
                duration: flight.duration,
                route: {
                    routeId: flight.route.id,
                    departureAirport: departureAirportCode,
                    arrivalAirport: arrivalAirportCode,
                    seatClass: seatClasses,
                },
                plane: {
                    planeId: flight.plane.id,
                    planeName: flight.plane.name,
                    planeCode: flight.plane.planeCode,
                    description: flight.plane.description,
                    baggage: flight.plane.baggage,
                    cabinBaggage: flight.plane.cabinBaggage,
                },
            };
        });

        const totalFlights = await prisma.flights.count({
            where: {
                route: {
                    departureAirportId: departureAirport.id,
                    arrivalAirportId: arrivalAirport.id,
                    seatClass: { name: seatClasses, },
                },
                departureTime: {
                    gte: new Date(parsedDate.setHours(0, 0, 0)),
                    lt: new Date(parsedDate.setHours(23, 59, 59)),
                },
            },
        });

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "Flights retrieved successfully",
            totalPages: Math.ceil(totalFlights / itemsPerPage),
            page: pageNumber,
            totalFlights: totalFlights,
            flights: availableFlightsResponse,
            returnFlights: availableReturnFlightsResponse,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { searchFlights };
