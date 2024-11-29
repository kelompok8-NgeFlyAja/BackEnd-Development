const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addNewClass = async (req, res, next) => {
    try {
        const {name, priceAdult, priceChild, priceBaby} = req.body;
        if (name == null || priceAdult == null || priceChild == null || priceBaby == null) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }
        if (typeof name !== "string" || isNaN(priceAdult) || isNaN(priceChild) || isNaN(priceBaby)) {
            return res.status(400).json({ message: "Invalid input data." });
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
            message: 'Route and seat classes created successfully.',
            seatClass,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating route and seat classes.', error: error.message });
    }
};

const getAllClasses = async (req, res, next) => {
    try {
        const seatClasses = await prisma.seatClasses.findMany();
        return res.status(200).json({ seatClasses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching seat classes.', error: error.message });
    }
}

const getUniqueClass = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (id == null) {
            return res.status(400).json({ message: "Please provide the class ID." });
        }
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid class ID." });
        }
        const seatClass = await prisma.seatClasses.findUnique({
            where: {
                id: parseInt(id),
            },
        });
        if (seatClass == null) {
            return res.status(404).json({ message: "Class not found." });
        }
        return res.status(200).json({ seatClass });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching seat class.', error: error.message });
    }
}

const updateClass = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {name, priceAdult, priceChild, priceBaby} = req.body;
        if (isNaN(id) || typeof name !== "string" || isNaN(priceAdult) || isNaN(priceChild) || isNaN(priceBaby)) {
            return res.status(400).json({ message: "Invalid input data." });
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
        return res.status(200).json({ message: 'Class updated successfully.', seatClass });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating seat class.', error: error.message });
    }
}

const deleteClass = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (id == null) {
            return res.status(400).json({ message: "Please provide the class ID." });
        }
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid class ID." });
        }
        const seatClass = await prisma.seatClasses.delete({
            where: {
                id: parseInt(id),
            },
        });
        return res.status(200).json({ message: 'Class deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting seat class.', error: error.message });
    }
}

module.exports = {addNewClass, getAllClasses,getUniqueClass, updateClass, deleteClass};