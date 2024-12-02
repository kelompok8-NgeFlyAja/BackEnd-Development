const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const generateSeats = require('../src/utils/generateSeats');
const generateDuration = require('../src/utils/durationUtil');
const imagekit = require('../src/config/imagekit');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');

const password = process.env.PASSWORD
const salt = parseInt(process.env.PASSWORD_SALT)

const hashedPassword = bcrypt.hashSync(password, salt);


const uploadImage = async (localImagePath, fileName) => {
    try {
        const imageBuffer = await fs.readFile(localImagePath);
        const stringFile = imageBuffer.toString("base64");

        const result = await imagekit.upload({
            file: stringFile,
            fileName: fileName,
        });

        return result.url
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};

async function main() {
    try {
        await prisma.seatClasses.deleteMany();
        await prisma.routes.deleteMany();
        await prisma.airports.deleteMany();
        await prisma.planes.deleteMany();
        await prisma.seats.deleteMany();
        await prisma.flights.deleteMany();
        await prisma.promotions.deleteMany();

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
                {
                    name: 'Los Angeles International Airport',
                    city: 'Los Angeles',
                    country: 'United States',
                    continent: 'America',
                    airportCode: 'LAX',
                },
                {
                    name: 'Dubai International Airport',
                    city: 'Dubai',
                    country: 'United Arab Emirates',
                    continent: 'Asia',
                    airportCode: 'DXB',
                },
                {
                    name: 'Singapore Changi Airport',
                    city: 'Singapore',
                    country: 'Singapore',
                    continent: 'Asia',
                    airportCode: 'SIN',
                },
                {
                    name: 'Hong Kong International Airport',
                    city: 'Hong Kong',
                    country: 'Hong Kong',
                    continent: 'Asia',
                    airportCode: 'HKG',
                },
                {
                    name: 'Incheon International Airport',
                    city: 'Seoul',
                    country: 'South Korea',
                    continent: 'Asia',
                    airportCode: 'ICN',
                },
                {
                    name: 'Narita International Airport',
                    city: 'Tokyo',
                    country: 'Japan',
                    continent: 'Asia',
                    airportCode: 'NRT',
                },
                {
                    name: 'Kuala Lumpur International Airport',
                    city: 'Kuala Lumpur',
                    country: 'Malaysia',
                    continent: 'Asia',
                    airportCode: 'KUL',
                },
                {
                    name: 'Ngurah Rai International Airport',
                    city: 'Denpasar',
                    country: 'Indonesia',
                    continent: 'Asia',
                    airportCode: 'DPS',
                },
                {
                    name: 'Leonardo da Vinci International Airport',
                    city: 'Roma',
                    country: 'Italy',
                    continent: 'Europe',
                    airportCode: 'FCO',
                },
                {
                    name: 'Frankfurt Airport',
                    city: 'Frankfurt',
                    country: 'Germany',
                    continent: 'Europe',
                    airportCode: 'FRA',
                },
                {
                    name: 'Amsterdam Airport Schiphol',
                    city: 'Amsterdam',
                    country: 'Netherlands',
                    continent: 'Europe',
                    airportCode: 'AMS',
                },
                {
                    name: 'Zurich Airport',
                    city: 'Zurich',
                    country: 'Switzerland',
                    continent: 'Europe',
                    airportCode: 'ZRH',
                },
                {
                    name: 'Moscow Sheremetyevo International Airport',
                    city: 'Moscow',
                    country: 'Russia',
                    continent: 'Europe',
                    airportCode: 'SVO',
                }

            ],
            skipDuplicates: true,
        });


        const planesData = [
            {
                planeName: 'Jet Air',
                totalSeat: 72,
                planeCode: 'JT-201',
                airline: 'Air Asia',
                baggage: 8,
                cabinBaggage: 20,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Boeing 737',
                totalSeat: 54,
                planeCode: 'B-737',
                airline: 'Garuda Indonesia',
                baggage: 6,
                cabinBaggage: 16,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Jet Air 2',
                totalSeat: 60,
                planeCode: 'JT-202',
                airline: 'Lion Air',
                baggage: 5,
                cabinBaggage: 15,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Boeing 747',
                totalSeat: 48,
                planeCode: 'B-747',
                airline: 'Sriwijaya Air',
                baggage: 4,
                cabinBaggage: 12,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Jet Air 3',
                totalSeat: 66,
                planeCode: 'JT-203',
                airline: 'Batik Air',
                baggage: 7,
                cabinBaggage: 18,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Boeing 777',
                totalSeat: 42,
                planeCode: 'B-777',
                airline: 'Citilink',
                baggage: 3,
                cabinBaggage: 10,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Jet Air 4',
                totalSeat: 66,
                planeCode: 'JT-204',
                airline: 'Citilink',
                baggage: 6,
                cabinBaggage: 17,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Boeing 787',
                totalSeat: 36,
                planeCode: 'B-787',
                airline: 'Citilink',
                baggage: 2,
                cabinBaggage: 8,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Jet Air 5',
                totalSeat: 60,
                planeCode: 'JT-205',
                airline: 'Citilink',
                baggage: 5,
                cabinBaggage: 15,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Boeing 737 Max',
                totalSeat: 54,
                planeCode: 'B-737M',
                airline: 'Air Asia',
                baggage: 4,
                cabinBaggage: 14,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Jet Air 6',
                totalSeat: 66,
                planeCode: 'JT-206',
                airline: 'Air Asia',
                baggage: 7,
                cabinBaggage: 18,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Boeing 747-8',
                totalSeat: 48,
                planeCode: 'B-747-8',
                airline: 'Air Asia',
                baggage: 3,
                cabinBaggage: 13,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Jet Air 7',
                totalSeat: 72,
                planeCode: 'JT-207',
                airline: 'Air Asia',
                baggage: 8,
                cabinBaggage: 20,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Boeing 777-300',
                totalSeat: 42,
                planeCode: 'B-777-300',
                airline: 'Air Asia',
                baggage: 2,
                cabinBaggage: 10,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Jet Air 8',
                totalSeat: 60,
                planeCode: 'JT-208',
                airline: 'Air Asia',
                baggage: 5,
                cabinBaggage: 15,
                description: "In Flight Entertainment",
            }
        ];

        for (const plane of planesData) {
            const createdPlane = await prisma.planes.create({
                data: {
                    planeName: plane.planeName,
                    totalSeat: plane.totalSeat,
                    planeCode: plane.planeCode,
                    airline: plane.airline,
                    baggage: plane.baggage,
                    cabinBaggage: plane.cabinBaggage,
                    description: plane.description,
                },
            });
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
                        departureAirportId: 1, //jakarta
                        arrivalAirportId: 2,//bangkok
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
                        departureAirportId: 1,//jakarta
                        arrivalAirportId: 4,//melbourne
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
                        departureAirportId: 1,//jakarta
                        arrivalAirportId: 6,//paris
                    },
                },
            },
            include: {
                route: true,
            },
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 4950000,
                priceChild: 4500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 2,//bangkok
                        arrivalAirportId: 3,//sydney
                    },
                },
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Business',
                priceAdult: 9950000,
                priceChild: 9500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 2,//bangkok
                        arrivalAirportId: 5,//cairo
                    },
                },
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'First Class',
                priceAdult: 14950000,
                priceChild: 14500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 4,//melbourne
                        arrivalAirportId: 9,//los angeles
                    },
                },
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Premium Economy',
                priceAdult: 6450000,
                priceChild: 6000000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 4,//melbourne
                        arrivalAirportId: 10,//dubai
                    },
                },
            }
        })

        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 6000000,
                priceChild: 5500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 5,//cairo
                        arrivalAirportId: 7,//london
                    }
                }
            }
        })

        await prisma.seatClasses.create({
            data: {
                name: 'Business',
                priceAdult: 11000000,
                priceChild: 10500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 5,//cairo
                        arrivalAirportId: 8,//new york
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'First Class',
                priceAdult: 16500000,
                priceChild: 16000000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 6,//paris
                        arrivalAirportId: 8,//new york
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 6500000,
                priceChild: 6000000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 7,//london
                        arrivalAirportId: 8,//new york
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Business',
                priceAdult: 11500000,
                priceChild: 11000000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 7,//london
                        arrivalAirportId: 9,//washington
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'First Class',
                priceAdult: 17000000,
                priceChild: 16500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 8,//new york
                        arrivalAirportId: 9,//washington
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 7000000,
                priceChild: 6500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 9,//washington
                        arrivalAirportId: 10,//dubai
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Business',
                priceAdult: 12000000,
                priceChild: 11500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 9,//washington
                        arrivalAirportId: 11,//singapore
                    }
                }
            },
        });

        await prisma.seatClasses.create({
            data: {
                name: 'First Class',
                priceAdult: 17500000,
                priceChild: 17000000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 10,//dubai
                        arrivalAirportId: 11,//singapore
                    }
                }
            }
        });

        const promoData = [
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/bangkok.png',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-31T23:59:59.000'),
                discount: 50000
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/melbourne.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-10T23:59:59.000'),
                discount: 1000000
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/paris.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-15T23:59:59.000'),
                discount: 1500000
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/sydney.png',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-20T23:59:59.000'),
                discount: 50000
            },
            {
                promotionName: '50% Off',
                localImagePath: './prisma/images/cairo.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-25T23:59:59.000'),
                discount: 50000
            },
            {
                promotionName: '50% Off',
                localImagePath: './prisma/images/LA.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-30T23:59:59.000'),
                discount: 50000
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/dubai.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-31T23:59:59.000'),
                discount: 50000
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/london.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-31T23:59:59.000'),
                discount: 500000
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/newyork.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-20T23:59:59.000'),
                discount: 500000
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/newyork.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-20T23:59:59.000'),
                discount: 500000
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/newyork.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-20T23:59:59.000'),
                discount: 500000
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/wdc.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-20T23:59:59.000'),
                discount: 500000
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/wdc.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-20T23:59:59.000'),
                discount: 100000
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/dubai.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-31T23:59:59.000'),
                discount: 100000
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/sg.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-31T23:59:59.000'),
                discount: 500000
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/sg.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-31T23:59:59.000'),
                discount: 500000
            }
        ]

        for (const promo of promoData) {
            const imageUrl = await uploadImage(promo.localImagePath, promo.promotionName);
            await prisma.promotions.create({
                data: {
                    promotionName: promo.promotionName,
                    image: imageUrl,
                    startDate: promo.startDate,
                    endDate: promo.endDate,
                    discount: promo.discount
                }
            })
        }

        await prisma.flights.createMany({
            data: [
                {
                    departureTime: new Date('2024-12-01T08:00:00.000'),
                    arrivalTime: new Date('2024-12-01T11:30:00.000'),
                    promotionId: 1,
                    planeId: 1,
                    routeId: 1,
                    duration: generateDuration('2024-12-01T08:00:00.000', '2024-12-01T11:30:00.000'),
                    flightCode: 'Flight-001',
                },
                {
                    departureTime: new Date('2024-12-01T09:00:00.000'),
                    arrivalTime: new Date('2024-12-01T15:25:00.000'),
                    promotionId: 2,
                    planeId: 2,
                    routeId: 2,
                    duration: generateDuration('2024-12-01T09:00:00.000', '2024-12-01T15:25:00.000'),
                    flightCode: 'Flight-002',
                },
                {
                    departureTime: new Date('2024-12-02T07:00:00.000'),
                    arrivalTime: new Date('2024-12-03T00:35:00.000'),
                    promotionId: 3,
                    planeId: 3,
                    routeId: 3,
                    duration: generateDuration('2024-12-02T07:00:00.000', '2024-12-03T00:35:00.000'),
                    flightCode: 'Flight-003',
                },
                {
                    departureTime: new Date('2024-12-02T08:00:00.000'),
                    arrivalTime: new Date('2024-12-02T11:30:00.000'),
                    promotionId: 4,
                    planeId: 4,
                    routeId: 4,
                    duration: generateDuration('2024-12-02T08:00:00.000', '2024-12-02T11:30:00.000'),
                    flightCode: 'Flight-004',
                },
                {
                    departureTime: new Date('2024-12-03T08:00:00.000'),
                    arrivalTime: new Date('2024-12-03T11:30:00.000'),
                    promotionId: 5,
                    planeId: 5,
                    routeId: 5,
                    duration: generateDuration('2024-12-03T08:00:00.000', '2024-12-03T11:30:00.000'),
                    flightCode: 'Flight-005',
                },
                {
                    departureTime: new Date('2024-12-03T09:00:00.000'),
                    arrivalTime: new Date('2024-12-03T15:25:00.000'),
                    promotionId: 6,
                    planeId: 6,
                    routeId: 6,
                    duration: generateDuration('2024-12-03T09:00:00.000', '2024-12-03T15:25:00.000'),
                    flightCode: 'Flight-006',
                },
                {
                    departureTime: new Date('2024-12-04T07:00:00.000'),
                    arrivalTime: new Date('2024-12-05T00:35:00.000'),
                    promotionId: 7,
                    planeId: 7,
                    routeId: 7,
                    duration: generateDuration('2024-12-04T07:00:00.000', '2024-12-05T00:35:00.000'),
                    flightCode: 'Flight-007',
                },
                {
                    departureTime: new Date('2024-12-04T08:00:00.000'),
                    arrivalTime: new Date('2024-12-04T11:30:00.000'),
                    promotionId: 8,
                    planeId: 8,
                    routeId: 8,
                    duration: generateDuration('2024-12-04T08:00:00.000', '2024-12-04T11:30:00.000'),
                    flightCode: 'Flight-008',
                },
                {
                    departureTime: new Date('2024-12-05T08:00:00.000'),
                    arrivalTime: new Date('2024-12-05T11:30:00.000'),
                    promotionId: 9,
                    planeId: 9,
                    routeId: 9,
                    duration: generateDuration('2024-12-05T08:00:00.000', '2024-12-05T11:30:00.000'),
                    flightCode: 'Flight-009',
                },
                {
                    departureTime: new Date('2024-12-05T09:00:00.000'),
                    arrivalTime: new Date('2024-12-05T15:25:00.000'),
                    promotionId: 10,
                    planeId: 10,
                    routeId: 10,
                    duration: generateDuration('2024-12-05T09:00:00.000', '2024-12-05T15:25:00.000'),
                    flightCode: 'Flight-010',
                },
                {
                    departureTime: new Date('2024-12-06T07:00:00.000'),
                    arrivalTime: new Date('2024-12-07T00:35:00.000'),
                    promotionId: 11,
                    planeId: 11,
                    routeId: 11,
                    duration: generateDuration('2024-12-06T07:00:00.000', '2024-12-07T00:35:00.000'),
                    flightCode: 'Flight-011',
                },
                {
                    departureTime: new Date('2024-12-06T08:00:00.000'),
                    arrivalTime: new Date('2024-12-06T11:30:00.000'),
                    promotionId: 12,
                    planeId: 12,
                    routeId: 12,
                    duration: generateDuration('2024-12-06T08:00:00.000', '2024-12-06T11:30:00.000'),
                    flightCode: 'Flight-012',
                },
                {
                    departureTime: new Date('2024-12-07T08:00:00.000'),
                    arrivalTime: new Date('2024-12-07T11:30:00.000'),
                    promotionId: 13,
                    planeId: 13,
                    routeId: 13,
                    duration: generateDuration('2024-12-07T08:00:00.000', '2024-12-07T11:30:00.000'),
                    flightCode: 'Flight-013',
                },
                {
                    departureTime: new Date('2024-12-07T09:00:00.000'),
                    arrivalTime: new Date('2024-12-07T15:25:00.000'),
                    promotionId: 14,
                    planeId: 14,
                    routeId: 14,
                    duration: generateDuration('2024-12-07T09:00:00.000', '2024-12-07T15:25:00.000'),
                    flightCode: 'Flight-014',
                },
                {
                    departureTime: new Date('2024-12-08T07:00:00.000'),
                    arrivalTime: new Date('2024-12-09T00:35:00.000'),
                    promotionId: 15,
                    planeId: 15,
                    routeId: 15,
                    duration: generateDuration('2024-12-08T07:00:00.000', '2024-12-09T00:35:00.000'),
                    flightCode: 'Flight-015',
                },
            ]
        });

        await prisma.users.create({
            data: {
                name: 'John',
                email: 'john@mail.com',
                phoneNumber: '081234567890',
                password: hashedPassword,
                isActivated: true,
            }
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