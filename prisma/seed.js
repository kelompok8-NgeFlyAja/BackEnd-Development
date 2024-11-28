const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const generateSeats = require('../src/utils/generateSeats');
const generateDuration = require('../src/utils/durationUtil');

async function main() {
    try {
        await prisma.seatClasses.deleteMany();
        await prisma.routes.deleteMany();
        await prisma.airports.deleteMany();
        await prisma.planes.deleteMany();
        await prisma.seats.deleteMany();
        await prisma.flights.deleteMany();

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


        await prisma.seatClasses.create({
            data:
            {
                name: 'Economy',
                priceAdult: 4950000,
                priceChild: 4500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 1,
                        arrivalAirportId: 2,
                    },
                },
            },
            include: {
                route: true,
            },
        });

        await prisma.seatClasses.create({
            data:
            {
                name: 'Business',
                priceAdult: 9950000,
                priceChild: 9500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 1,
                        arrivalAirportId: 4,
                    },
                },
            },
            include: {
                route: true,
            },
        });

        await prisma.seatClasses.create({
            data:
            {
                name: 'First Class',
                priceAdult: 14950000,
                priceChild: 14500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 1,
                        arrivalAirportId: 6,
                    },
                },
            },
            include: {
                route: true,
            },
        });

        const duration1 = generateDuration('2024-12-01T08:00:00.000', '2024-12-01T11:30:00.000');

        await prisma.flights.create({
            data: {
                departureTime: new Date('2024-12-01T08:00:00.000'),
                arrivalTime: new Date('2024-12-01T11:30:00.000'),
                planeId: 1,
                routeId: 1,
                duration: duration1,
                flightCode: 'Flight-001',
            },
        });
        const duration2 = generateDuration('2024-12-01T09:00:00.000', '2024-12-01T15:25:00.000');

        await prisma.flights.create({
            data: {
                departureTime: new Date('2024-12-01T09:00:00.000'),
                arrivalTime: new Date('2024-12-01T15:25:00.000'),
                planeId: 2,
                routeId: 2,
                duration: duration2,
                flightCode: 'Flight-002',
            },
        });

        const duration3 = generateDuration('2024-12-02T07:00:00.000', '2024-12-03T00:35:00.000');

        await prisma.flights.create({
            data: {
                departureTime: new Date('2024-12-02T07:00:00.000'),
                arrivalTime: new Date('2024-12-03T00:35:00.000'),
                planeId: 3,
                routeId: 3,
                duration: duration3,
                flightCode: 'Flight-003',
            },
        });

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