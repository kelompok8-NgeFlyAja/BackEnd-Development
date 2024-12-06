const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
    try {
        console.log(req.cookies.token);
        console.log(req.headers.authorization);
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        
        
		if (!token) {
			const error = new Error("Unauthorized Page!");
			error.statusCode = 401;
			throw error;
		}

		jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
			if (err) {
				res.clearCookie("token");
				const error = new Error("Unauthorized Page");
				error.statusCode = 401;
				throw error;
			}

            req.user = {
                id: decode.id,
                email: decode.email,
                name: decode.name,
                role: decode.role
            };

			console.log(req.user, "-> from authMiddleware");
			next();
		});
	} catch (error) {
		next(error);
	}
};

module.exports = authentication;
