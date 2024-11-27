const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const randomGenerator = async () => {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const len = 10;
	let transactionCode = "";
	let loop = true;

	while (loop) {
		transactionCode = "";
		for (let i = 0; i < len; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			transactionCode += characters[randomIndex];
		}

		loop = isCodeAvailable !== null;
	}

	return transactionCode;
};

module.exports = randomGenerator;
