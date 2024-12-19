const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getSeat = async (req, res, next) => {
	const seats = await prisma.seats.findMany({
		orderBy: {
			id: 'asc'
		}
	});
	return res.status(200).json({ seats });
}

const getSeatById = async (req, res, next) => {
	const { id } = req.params;

	const seats = await prisma.seats.findMany({
		where: {
			planeId: parseInt(id),
		},
		orderBy: {
			id: 'asc'
		}
	});

	const groupedSeats = {};

	for (const seat of seats) {
		const col = seat.seatNumber.slice(-1);
		if (!groupedSeats[col]) {
			groupedSeats[col] = [];
		}
		groupedSeats[col].push(seat);
	}

	return res.status(200).json({
		status: "success",
		statusCode: 200,
		message: "Successfully fetched seats",
		data: groupedSeats
	});
}

const resetSeat = async (req, res, next) => {
    try {
        const { planeId } = req.params;
        const convertPlaneId = parseInt(planeId);

        if (isNaN(convertPlaneId)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid plane ID"
            });
        }

        const seats = await prisma.seats.findMany({
            where: { planeId: convertPlaneId },
            select: { id: true },
        });

        if (seats.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No seats found for the specified plane ID."
            });
        }

        const seatIds = seats.map(seat => seat.id);

        const updatedSeats = await prisma.seats.updateMany({
            where: { id: { in: seatIds } },
            data: { isAvailable: true },
        });

        const resetPassengers = await prisma.passengers.updateMany({
            where: { seatId: { in: seatIds } },
            data: { seatId: null },
        });

        return res.status(200).json({
            status: "success",
            message: `Successfully reset availability for ${updatedSeats.count} seats and cleared seat IDs for ${resetPassengers.count} passengers.`
        });

    } catch (error) {
        console.error("Error resetting seats: ", error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while resetting seats and passenger seat IDs."
        });
    }
};


module.exports = { resetSeat, getSeat, getSeatById };
