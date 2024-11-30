const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const randomGenerator = async () => {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const len = 10;
	let bookingCode = "";
	let loop = true;

	while (loop) {
		bookingCode = "";
		for (let i = 0; i < len; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			bookingCode += characters[randomIndex];
		}
		const isCodeAvailable = await prisma.bookings.findFirst({
            where: { bookingCode: bookingCode }
        });

		loop = isCodeAvailable !== null;
	}

	return bookingCode;
};

module.exports = randomGenerator;
