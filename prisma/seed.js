const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const generateSeats = require('../src/utils/generateSeats');

async function main() {
    try {
        await prisma.airports.deleteMany();

        const airports = await prisma.airports.createMany({
            data: [
                {
                    name: 'Soekarno Hatta - Terminal 1A Domestik',
                    city: 'Tangerang',
                    country: 'Indonesia',
                    continent: 'Asia',
                    airportCode: 'CGK',
                },
                {
                    name: 'Suvarnabhumi Airport',
                    city: 'Bangkok',
                    country: 'Thailand',
                    continent: 'Asia',
                    airportCode: 'BKK',
                },
                {
                    name: 'Sydney Airport',
                    city: 'Sydney',
                    country: 'Australia',
                    continent: 'Australia',
                    airportCode: 'SYD',
                },
                {
                    name: 'Melbourne Airport',
                    city: 'Melbourne',
                    country: 'Australia',
                    continent: 'Australia',
                    airportCode: 'MEL',
                },
                {
                    name: 'Cairo International Airport',
                    city: 'Cairo',
                    country: 'Egypt',
                    continent: 'Africa',
                    airportCode: 'CAI',
                },
                {
                    name: 'Paris Charles de Gaulle Airport',
                    city: 'Paris',
                    country: 'France',
                    continent: 'Europe',
                    airportCode: 'CDG',
                },
                {
                    name: 'Heathrow Airport',
                    city: 'London',
                    country: 'United Kingdom',
                    continent: 'Europe',
                    airportCode: 'LHR',
                },
                {
                    name: 'John F. Kennedy International Airport',
                    city: 'New York',
                    country: 'United States',
                    continent: 'America',
                    airportCode: 'JFK',
                },
                {
                    name: 'Washington Dulles International Airport',
                    city: 'Washington',
                    country: 'United States',
                    continent: 'America',
                    airportCode: 'IAD',
                },
            ],
            skipDuplicates: true,
        });

        await prisma.planes.deleteMany();
        await prisma.seats.deleteMany();
        const planesData = [
            {
                planeName: 'Jet Air',
                totalSeat: 72,
                planeCode: 'JT-201',
                baggage: 8,
                cabinBaggage: 20,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Boeing 737',
                totalSeat: 54,
                planeCode: 'B-737',
                baggage: 6,
                cabinBaggage: 16,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Jet Air 2',
                totalSeat: 60,
                planeCode: 'JT-202',
                baggage: 5,
                cabinBaggage: 15,
                description: "In Flight Entertainment",
            },
        ];

        for (const plane of planesData) {
            const createdPlane = await prisma.planes.create({
                data: {
                    planeName: plane.planeName,
                    totalSeat: plane.totalSeat,
                    planeCode: plane.planeCode,
                    baggage: plane.baggage,
                    cabinBaggage: plane.cabinBaggage,
                    description: plane.description,
                },
            });
            // console.log(`plane ID: ${createdPlane.id}`);
            await generateSeats(createdPlane.id, plane.totalSeat);

        }


        console.log(`Database has been seeded. 🌱`);
    } catch (error) {
        throw error;
    }

}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })