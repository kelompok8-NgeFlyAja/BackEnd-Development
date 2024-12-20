const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const updateUser = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const { name, phoneNumber, email } = req.body;

        if (!name && !phoneNumber && !email) {
            const error = new Error("At least one field is required to update.");
            error.status = 400;
            throw error;
        }
        const data = {};
        if (name) data.name = name;
        if (phoneNumber) data.phoneNumber = phoneNumber;
        if (email) data.email = email;

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: data,
        });
        res.status(200).json({
            status: "Success",
            statusCode: 200,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        next(error);
    }
};

const getUser = async (req, res, next) => {
    try {
        const userId = req.user.id

        const user = await prisma.users.findUnique({
            where: {id: userId}
        });

        if (!user) {
            const error = new Error("User Not Found");
            error.statusCode = 404
            throw error;
        }

        res.status(200).json({
            status: "Success",
            statusCode: 200,
            message: "Data Retrieved Successfully",
            data: {
                name: user.name,
                phoneNumber: user.phoneNumber,
                email: user.email
            }
        });
    } catch (error) {
        next(error)
    }
}

module.exports = {updateUser, getUser};