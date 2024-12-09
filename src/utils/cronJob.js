const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { core } = require("../config/midtrans");

const startCronJob = () => {
	cron.schedule("*/15 * * * * *", async () => {
		console.log("Checking for expired payments...");
		try {
			const banks = ["mandiri", "bca", "bni", "bri"];
	
			const expiredPayments = await prisma.payments.findMany({
				where: {
					status: "Unpaid",
					expiredDate: {
						lt: new Date(),
					},
				},
			});
	
			console.log(expiredPayments);
	
			for (const payment of expiredPayments) {
				for (let bank of banks) {
					const transactionId = `${payment.bookingId}-${bank}`;
					console.log(
						`Canceling payment for : ${transactionId} on ${bank}`
					);
	
					await core.transaction.cancel(transactionId);
				}
	
				await prisma.payments.update({
					where: { id: payment.id },
					data: {
						status: "Cancelled",
					},
				});
	
				await prisma.bookings.update({
					where: { id: payment.bookingId },
					data: {
						status: "CANCEL",
					},
				});
	
				console.log(
					`Payment with Booking ID ${payment.bookingId} has been marked as expired and canceled.`
				);
			}
		} catch (error) {
			next(error)
		}
	});
}

module.exports = { startCronJob };