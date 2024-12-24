const errorHandler = (error, req, res, next) => {
	if (process.env.NODE_ENV !== 'test') {
        console.log(error);
    }

	const statusCode = error.statusCode || 500;
	const message = error.message || "There's Something Wrong with The Server!";

	res.status(statusCode).json({
		status: "Failed",
		statusCode: statusCode,
		message: message,
	});
};

module.exports = errorHandler;