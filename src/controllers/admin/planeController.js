const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const generateSeats = require('../../utils/generateSeats');

const addNewPlane = async (req, res, next) => {
    try {
        const { planeName, planeCode, totalSeat, description, baggage, cabinBaggage } = req.body;
        const parseSeat = parseInt(totalSeat);
        const parseBaggage = parseInt(baggage);
        const parseCabinBaggage = parseInt(cabinBaggage);

        if (!planeName || !planeCode || !totalSeat || !description || !baggage || !cabinBaggage) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (parseSeat < 1) {
            return res.status(400).json({ message: 'Total seat must be greater than 0' });
        }

        const plane = await prisma.planes.create({
            data: {
                planeName,
                planeCode,
                totalSeat: parseSeat,
                description,
                baggage: parseBaggage,
                cabinBaggage: parseCabinBaggage,
            },
            include: {
                seats: true,
            },
        });

        console.log(plane);
        await generateSeats(plane.id, parseSeat);

        return res.status(200).json({
            status: 200,
            message: 'Plane added successfully',
            data: plane
        });

    } catch (error) {
        next(error);
    }

}

const getPlanes = async (req, res, next) => {
    try {
        const planes = await prisma.planes.findMany({
            include: {
                seats: true
            }
        });

        return res.status(200).json({
            status: 200,
            message: 'All planes',
            data: planes
        });

    } catch (error) {
        next(error);
    }
}

const getPlaneById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const plane = await prisma.planes.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                seats: true
            }
        });

        if (!plane) {
            return res.status(404).json({
                status: 404,
                message: 'Plane not found'
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Plane found',
            data: plane
        });
    } catch (error) {
        next(error);
    }
}

const deletePlane = async (req, res, next) => {
    try {
        const { id } = req.params;
        const plane = await prisma.planes.delete({
            where: {
                id: Number(id)
            }
        });

        return res.status(200).json({
            status: 200,
            message: 'Plane deleted successfully',
            data: plane
        });
    } catch (error) {
        next(error);
    }

}
const updatePlane = async (req, res, next) => {
}


module.exports = { addNewPlane, getPlanes, getPlaneById, deletePlane, updatePlane };