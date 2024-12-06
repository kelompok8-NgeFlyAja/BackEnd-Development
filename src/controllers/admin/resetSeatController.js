const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const resetSeat = async (req, res, next) => {
	try {
		const { planeId } = req.params;
		const convertPlaneId = parseInt(planeId);

		if (isNaN(convertPlaneId)) {
			const error = new Error("Invalid plane ID");
			error.statusCode = 400;
			throw error;
		}

		const updatedSeats = await prisma.seats.updateMany({
			where: { planeId: convertPlaneId },
			data: { isAvailable: true },
		});

		if (updatedSeats.count > 0) {
			return res.status(200).json({
				status: "success",
				message: `Successfully reset availability for ${updatedSeats.count} seats.`,
			});
		} else {
			return res.status(404).json({
				status: "error",
				message: `No seats found for planeId ${convertPlaneId}.`,
			});
		}
	} catch (error) {
		next(error);
	}
};

module.exports = resetSeat;
