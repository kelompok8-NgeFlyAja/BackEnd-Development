const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const randomIdGenerator = async () => {
	const characters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
	const len = 8;
	let id = "";
	let loop = true;

	while (loop) {
		id = "";

		for (let i = 0; i < len; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			id += characters[randomIndex];
		}

		const isCodeAvailable = await prisma.bookings.findUnique({
			where: { id: parseInt(id) },
		});

		loop = isCodeAvailable !== null;
	}

	return id;
};

module.exports = randomIdGenerator;
