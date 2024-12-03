const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const searchFlights = async (req, res, next) => {
    try {
        const { departureAirportId, arrivalAirportId, departureTime, seatClasses, adultPassenger, childPassenger, babyPassenger } = req.query;
        if (isNaN(departureAirportId) || isNaN(arrivalAirportId) || typeof seatClasses !== "string" || isNaN(adultPassenger) || isNaN(childPassenger) || isNaN(babyPassenger)) {
            const error = new Error("Invalid input data");
			error.status = 400;
			throw error;
        }

        if (!departureAirportId || !arrivalAirportId || !departureTime || !seatClasses || !adultPassenger || !childPassenger || !babyPassenger) {
            const error = new Error("Please provide all required fields");
			error.status = 400;
			throw error;
        }

        const totalPassengers = parseInt(adultPassenger) + parseInt(childPassenger) + parseInt(babyPassenger);

        const parsedDate = new Date(departureTime);
        if (isNaN(parsedDate)) {
            const error = new Error("Invalid date format");
			error.status = 400;
			throw error;
        }

        const flights = await prisma.flights.findMany({
            where: {
                route: {
                    departureAirportId: parseInt(departureAirportId),
                    arrivalAirportId: parseInt(arrivalAirportId),
                    seatClass: {
                        name: seatClasses, 
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
        });

        const availableFlights = flights.filter((flight) => {
            const availableSeats = flight.plane.seats.filter((seat) => seat.isAvailable).length;
            console.log(`Seat tersedia: ${availableSeats}`);
            return availableSeats >= parseInt(totalPassengers); 
        });

        if (availableFlights.length === 0) {
            const error = new Error("No flights available for the given criteria");
			error.status = 404;
			throw error;
        }

        return res.status(200).json({
            message: "Flights found",
            flights: availableFlights,
    });
    } catch (error) {
        next(error);
    }
};

module.exports = { searchFlights };
