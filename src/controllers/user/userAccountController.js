const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ 
            status: "Failed", 
            statusCode: 401, 
            message: "Unauthorized. Please log in." 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                status: "Failed", 
                statusCode: 403, 
                message: "Invalid or expired token." 
            });
        }

        req.user = user;
        next();
    });
};


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

        const updatedUser = await prisma.Users.update({
            where: { id: userId },
            data: data,
        });

        res.status(200).json({
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        next(error);
    }
};


module.exports = { ensureAuthenticated, updateUser };