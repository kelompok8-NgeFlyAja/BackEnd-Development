const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addNewClass = async (req, res, next) => {
    try {
        const {name, priceAdult, priceChild, priceBaby} = req.body;
        if (name == null || priceAdult == null || priceChild == null || priceBaby == null) {
            const error = new Errror("Please provide all required fields");
			error.status(400);
			throw error;
        }
        if (typeof name !== "string" || isNaN(priceAdult) || isNaN(priceChild) || isNaN(priceBaby)) {
            const error = new Errror("Invalid input data");
			error.status(400);
			throw error;
        }        
        const seatClass = await prisma.seatClasses.create({
            data: {
                name: name.trim(),
                priceAdult: parseInt(priceAdult),
                priceChild: parseInt(priceChild),
                priceBaby: parseInt(priceBaby),
            },
        });

        return res.status(201).json({
            message: 'Route and seat classes created successfully',
            seatClass,
        });
    } catch (error) {
        next(error);
    }
};

const getAllClasses = async (req, res, next) => {
    try {
        const seatClasses = await prisma.seatClasses.findMany();
        return res.status(200).json({ seatClasses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching seat classes', error: error.message });
    }
}

const getUniqueClass = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (id == null) {
            const error = new Errror("Please provide the class ID");
			error.status(400);
			throw error;
        }
        if (isNaN(id)) {
            const error = new Errror("Invalid class ID");
			error.status(400);
			throw error;
        }
        const seatClass = await prisma.seatClasses.findUnique({
            where: {
                id: parseInt(id),
            },
        });
        if (seatClass == null) {
            const error = new Errror("Class not found");
			error.status(400);
			throw error;
        }
        return res.status(200).json({ seatClass });
    } catch (error) {
        next(error);
    }
}

const updateClass = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {name, priceAdult, priceChild, priceBaby} = req.body;
        if (isNaN(id) || typeof name !== "string" || isNaN(priceAdult) || isNaN(priceChild) || isNaN(priceBaby)) {
            const error = new Errror("Invalid input data");
			error.status(400);
			throw error;
        }
        const seatClass = await prisma.seatClasses.update({
            where: {
                id: parseInt(id),
            },
            data: {
                name: name.trim(),
                priceAdult: parseInt(priceAdult),
                priceChild: parseInt(priceChild),
                priceBaby: parseInt(priceBaby),
            },
        });
        return res.status(200).json({ message: 'Class updated successfully', seatClass });
    } catch (error) {
        next(error);
    }
}

const deleteClass = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (id == null) {
            const error = new Errror("Please provide the class ID");
			error.status(400);
			throw error;
        }
        if (isNaN(id)) {
            const error = new Errror("Invalid class ID");
			error.status(400);
			throw error;
        }
        const seatClass = await prisma.seatClasses.delete({
            where: {
                id: parseInt(id),
            },
        });
        return res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        next(error);
    }
}

module.exports = {addNewClass, getAllClasses,getUniqueClass, updateClass, deleteClass};