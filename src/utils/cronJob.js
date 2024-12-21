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
                include: {
                    booking: {
                        include: {
                            passengers: true
                        }
                    }
                }
            });
	
			for (const payment of expiredPayments) {
				for (let bank of banks) {
					const transactionId = `${payment.bookingId}-${bank}`;

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

				for (const passenger of payment.booking.passengers) {
                    if (passenger.seatId) {
						console.log(passenger.seatId);
                        await prisma.seats.update({
                            where: { id: passenger.seatId },
                            data: { isAvailable: true }
                        });

                        await prisma.passengers.update({
                            where: { id: passenger.id },
                            data: { seatId: null }
                        });
                    }
                }

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