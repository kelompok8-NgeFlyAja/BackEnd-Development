const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getFlightCard = async (req, res, next) => {
    try {
        const { page = 1, limit = 5, continent } = req.query;
        const whereClause = continent ? { continent } : {};

        const totalDestinations = await prisma.flights.count({
            where: {
                route: {
                    arrivalAirport: whereClause,
                },
            },
        });
        const offset = (page - 1) * limit;

        const destinations = await prisma.flights.findMany({
            skip: parseInt(offset),
            take: parseInt(limit),
            include: {
                route: {
                    include: {
                        departureAirport: true,
                        arrivalAirport: true,
                        seatClass: true
                    },
                },
                promotion: true,
            },
            where: {
                route: {
                    departureAirport: whereClause,
                },
            },
        });

        const formattedDestinations = destinations.map((flight) => ({
            departure: flight.route.departureAirport.city,
            arrival: flight.route.arrivalAirport.city,
            price: flight.route.seatClass.priceAdult - flight.promotion.discount,
            imageUrl: flight.promotion.image,
            label: flight.promotion.promotionName,
            startDate: flight.promotion.startDate.toISOString().split("T")[0],
            endDate: flight.promotion.endDate.toISOString().split("T")[0],
        }));

        console.log(formattedDestinations);
        

        res.status(200).json({
            status: "success",
            statusCode: 200,
            message: 'Successfully get flight card',
            total: totalDestinations,
            page: parseInt(page),
            limit: parseInt(limit),
            data: formattedDestinations,
        });
    } catch (error) {
        next(error);
    }
};


module.exports = { getFlightCard };

