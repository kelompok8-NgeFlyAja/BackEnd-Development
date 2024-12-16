const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { core } = require("../config/midtrans");

const startCronJob = () => {
	cron.schedule("*/15 * * * * *", async () => {
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

				const booking = await prisma.bookings.findUnique({
					where: {
						id: payment.bookingId
					}
				})

				await prisma.notifications.create({
					data: {
						userId: booking.userId,
						title: "Payment Status (Cancelled)",
						description: `Your Transaction Has Been Cancelled Because it Passed the Expired Date!`,
						createdAt: new Date(Date.now()),
						isRead: false
					},
				});
			}
		} catch (error) {
			next(error)
		}
	});
}

module.exports = { startCronJob };