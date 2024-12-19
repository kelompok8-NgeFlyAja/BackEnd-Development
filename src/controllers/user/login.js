const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

const login = async (req, res, next) => {
	try {
		// let { identity, password } = req.body;

		// if (!identity || !password) {
        //     const error = new Error("Email/Phone Number and password are required!");
        //     error.statusCode = 400;
        //     throw error;
        // }

		// const user = await prisma.users.findFirst({
        //     where: {
        //         OR: [
        //             { email: identity },
        //             { phoneNumber: identity }
        //         ]
        //     }
        // });

		// if (!user) {
		// 	const error = new Error("Email/Phone Number or password is wrong");
		// 	error.statusCode = 400;
		// 	throw error;
		// }

		// const passwordCheck = await bcrypt.compare(password, user.password);
		// if (!passwordCheck) {
		// 	const error = new Error("Email/Phone Number or password is wrong");
		// 	error.statusCode = 400;
		// 	throw error;
		// }

		let { email, password } = req.body;
		const user = await prisma.users.findUnique({ where: { email: email } });

		if (!email || !password) {
			const error = new Error("Email and password are required!");
			error.statusCode = 400;
			throw error;
		}

		if (!user) {
			const error = new Error("Email or password is wrong");
			error.statusCode = 400;
			throw error;
		}

		const passwordCheck = await bcrypt.compare(password, user.password);
		if (!passwordCheck) {
			const error = new Error("Email or password is wrong");
			error.statusCode = 400;
			throw error;
		}

		if (!user.isActivated) {
			const error = new Error("Please Activate Your Account First");
			error.statusCode = 400;
			throw error;
		}

		const accessToken = jwt.sign(
			{
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "3h" }
		);

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			maxAge: 3 * 60 * 60 * 1000,
		});

		res.status(200).json({
			status: "Success",
			statusCode: 200,
			message: "Login Successfull",
			accessToken: accessToken,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = login;
