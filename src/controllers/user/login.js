const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

const login = async(req, res, next) => {
    try {
        let { email, password} = req.body
        const user = await prisma.users.findUnique({ where: { email: email } });

        if (!email || !password) {
            const error = new Error("Email and password are required!");
            error.status = 400;
            throw error;
        }
        
        if (!user) {
            const error = new Error("Email or password is wrong");
            error.status = 401;
            throw error;
        }

        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) {
            const error = new Error("Email or password is wrong");
            error.status = 401;
            throw error;
        }

        const accessToken = jwt.sign({id: user.id, name: user.name ,email: user.email, role: user.role}, process.env.JWT_SECRET, {expiresIn: "3h"})
        console.log(accessToken);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: 3 * 60 * 60 * 1000
        })

        res.status(200).json({
            status: "Success",
            message: "Login Successfull",
            accessToken: accessToken
        })
    } catch (error) {
        next(Error)
    }
}

module.exports = login