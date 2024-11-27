const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateSeats(planeId, totalSeat) {
    const columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").slice(0, 6);
    const numRows = Math.ceil(totalSeat / columns.length);
    const seatsData = [];

    let seatId = 1;

    for (let row = 1; row <= numRows; row++) {
        for (let col = 0; col < columns.length; col++) {
            if (seatId > totalSeat) break;

            const seatNumber = `${row}${columns[col]}`;
            seatsData.push({
                planeId: planeId,
                seatNumber: seatNumber,
                isAvailable: true,
            });

            seatId++;
        }
    }

    await prisma.seats.createMany({
        data: seatsData,
        skipDuplicates: true,
    });
    // console.log(`plane ID: ${planeId}`);
}

module.exports = generateSeats;