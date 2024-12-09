const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const paymentTimers = new Map();

const startPaymentExpiryTimer = async (paymentId, bookingId, expiryTime) => {
	const interval = setInterval(async () => {
		const payment = await prisma.payments.findUnique({
			where: { id: paymentId },
		});

		if (!payment) {
			clearInterval(interval);
			return;
		}

		if (new Date(payment.expiredDate).getTime() <= Date.now()) {
			await prisma.payments.update({
				where: { id: paymentId },
				data: { status: "Cancelled" },
			});

			await prisma.bookings.update({
				where: { id: bookingId },
				data: { status: "Cancelled" },
			});

			console.log(
				`Payment for booking ${bookingId} has been cancelled due to expiration.`
			);

			clearInterval(interval);
		}
	}, 60000);
};

module.exports = { startPaymentExpiryTimer };
