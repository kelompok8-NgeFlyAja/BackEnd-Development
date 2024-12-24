const jwt = require("jsonwebtoken");

const authentication = (allowedRoles = ['user']) => {
    return async (req, res, next) => {
        try {
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

                if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
                    const error = new Error("Forbidden: You do not have access to this resource");
                    error.statusCode = 403;
                    throw error;
                }

                next();
            });
        } catch (error) {
            next(error);
        }
    };
};

module.exports = authentication;
