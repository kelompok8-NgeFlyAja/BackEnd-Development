const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addNewFlight = async (req, res, next) => {
    
}

const getAllFlight = async (req, res, next) => {
    try {
        const flights = await prisma.flights.findMany();
        res.status(200).json({flights});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getFlightDetail = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (id == null) {
            return res.status(400).json({ message: "Please provide the class ID." });
        }
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid class ID." });
        }
        const flight = await prisma.flights.findUnique({
            where: {
                id: parseInt(id)
            }
        });
        if (flight == null) {
            return res.status(404).json({ message: "Flight not found." });
        }
        res.status(200).json({flight});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateFlight = async (req, res, next) => {

}

const deleteFlight = async (req, res, next) => {

}

module.exports = { addNewFlight, getAllFlight, getFlightDetail, updateFlight, deleteFlight };