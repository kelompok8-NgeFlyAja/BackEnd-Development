const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const searchFlights = async (req, res) => {
    try {
        const { departureAirportId, arrivalAirportId, departureTime, seatClasses, adultPassenger, childPassenger, babyPassenger } = req.query;
        if (isNaN(departureAirportId) || isNaN(arrivalAirportId) || typeof seatClasses !== "string" || isNaN(adultPassenger) || isNaN(childPassenger) || isNaN(babyPassenger)) {
            return res.status(400).json({ message: "Invalid input data." });
        }

        if (!departureAirportId || !arrivalAirportId || !departureTime || !seatClasses || !adultPassenger || !childPassenger || !babyPassenger) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        const totalPassengers = parseInt(adultPassenger) + parseInt(childPassenger) + parseInt(babyPassenger);

        const parsedDate = new Date(departureTime);
        if (isNaN(parsedDate)) {
            return res.status(400).json({ message: "Invalid date format." });
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
            return res.status(404).json({ message: "No flights available for the given criteria." });
        }

        return res.status(200).json({
            message: "Flights found.",
            flights: availableFlights,
    });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error searching for flights.", error: error.message });
    }
};

module.exports = { searchFlights };
