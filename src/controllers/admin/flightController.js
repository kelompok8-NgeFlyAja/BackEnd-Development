const moment = require('moment-timezone');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addNewFlight = async (req, res, next) => {
    
}

const getAllFlight = async (req, res, next) => {
    try {
        const flights = await prisma.flights.findMany();
        
        const timeZone = 'Asia/Jakarta';
        const updatedFlights = flights.map(flight => {
            const departureTimeConvert = moment.utc(flight.departureTime).tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
            const arrivalTimeConvert = moment.utc(flight.arrivalTime).tz(timeZone).format('YYYY-MM-DD HH:mm:ss');

            return {
                ...flight,
                departureTime: departureTimeConvert,
                arrivalTime: arrivalTimeConvert
            };
        });

        res.status(200).json({updatedFlights});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getFlightDetail = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (id == null) {
            const error = new Error("Please provide the class ID");
			error.status = 400;
			throw error;
        }
        if (isNaN(id)) {
            const error = new Error("Invalid class ID");
			error.status = 400;
			throw error;
        }
        const flight = await prisma.flights.findUnique({
            where: {
                id: parseInt(id)
            }
        });
        if (flight == null) {
            const error = new Error("Flight not found");
			error.status = 404;
			throw error;
        }
        res.status(200).json({flight});
    } catch (error) {
        next(error);
    }
}

const updateFlight = async (req, res, next) => {

}

const deleteFlight = async (req, res, next) => {

}

module.exports = { addNewFlight, getAllFlight, getFlightDetail, updateFlight, deleteFlight };