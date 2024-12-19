const moment = require('moment-timezone');
const { PrismaClient } = require('@prisma/client');
const dayjs = require("dayjs");
const prisma = new PrismaClient();

const addNewFlight = async (req, res, next) => {
    try {
        const { routeId, planeId, promotionId, date, departureTime, arrivalTime, flightCode } = req.body;
        if (!routeId  || !planeId  || !promotionId  || !date  || !departureTime  || !arrivalTime  || !flightCode) {
            const error = new Error("Please provide all required fields");
            error.status = 400;
            throw error;
        } 
        if (isNaN(planeId) || isNaN(routeId) || isNaN(promotionId)) {
            const error = new Error("Invalid input data");
            error.status = 400;
            throw error;
        }
        const fullDepartureTime = `${date}T${departureTime}+07:00`; 
        const fullArrivalTime = `${date}T${arrivalTime}+07:00`;
        const start = dayjs(fullDepartureTime);
        const end = dayjs(fullArrivalTime);
        if (!start.isValid() || !end.isValid()) {
            const error = new Error("Invalid departure or arrival time format");
            error.status = 400;
            throw error;
        }
        const diffMinutes = end.diff(start, "minute");
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        const duration = `${hours}h ${minutes}m`;
        const flight = await prisma.flights.create({
            data: {
                departureTime: start.toISOString(),
                arrivalTime: end.toISOString(),
                planeId: parseInt(planeId),
                routeId: parseInt(routeId),
                promotionId: parseInt(promotionId),
                duration: duration,
                flightCode: flightCode,
            }
        }); 
        res.status(201).json({message: 'Flight added successfully', flight});
    } catch (error) {
        next(error);
    }
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
    try {
        const { id } = req.params;
        const { routeId, planeId, promotionId, date, departureTime, arrivalTime, flightCode } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({ message: "Invalid flight ID!" });
        }
        if (!date || !departureTime || !arrivalTime) {
            return res.status(400).json({ message: "Date, departureTime, and arrivalTime are required!" });
        }

        const combinedDeparture = new Date(`${date}T${departureTime}`);
        const combinedArrival = new Date(`${date}T${arrivalTime}`);
    
        if (isNaN(combinedDeparture) || isNaN(combinedArrival)) {
            return res.status(400).json({ message: "Invalid date or time format!" });
        }

        if (combinedArrival <= combinedDeparture) {
            return res.status(400).json({ message: "Arrival time must be after departure time!" });
        }
        const updateData = {
            routeId: routeId ? parseInt(routeId) : undefined,
            planeId: planeId ? parseInt(planeId) : undefined,
            promotionId: promotionId ? parseInt(promotionId) : undefined,
            departureTime: combinedDeparture,
            arrivalTime: combinedArrival,
            flightCode: flightCode || undefined,
        };

        const diffMs = combinedArrival - combinedDeparture;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        updateData.duration = `${hours}h ${minutes}m`;

        const updatedFlight = await prisma.flights.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        return res.status(200).json({
            status: "Success",
            message: "Flight updated successfully!",
            data: updatedFlight,
        });
        } catch (error) {
            console.error(error);
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Flight not found!" });
            }
            next(error);
        }
};

const deleteFlight = async (req, res, next) => {
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
        const flight = await prisma.flights.delete({
            where: {
                id: parseInt(id)
            }
        });
        res.status(200).json({message: 'Flight deleted successfully', flight});
    } catch (error) {
        next(error);
    }
}

module.exports = { addNewFlight, getAllFlight, getFlightDetail, updateFlight, deleteFlight };