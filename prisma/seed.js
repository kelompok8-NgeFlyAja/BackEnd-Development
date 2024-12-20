const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const generateSeats = require('../src/utils/generateSeats');
const generateDuration = require('../src/utils/durationUtil');
const imagekit = require('../src/config/imagekit');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');

const password = process.env.PASSWORD_SALT
const salt = parseInt(process.env.SALT)

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
            },
            {
                planeName: 'Boeing 787-9',
                totalSeat: 36,
                planeCode: 'B-787-9',
                airline: 'Air Asia',
                baggage: 2,
                cabinBaggage: 8,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Jet Air 9',
                totalSeat: 66,
                planeCode: 'JT-209',
                airline: 'Air Asia',
                baggage: 7,
                cabinBaggage: 18,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Boeing 737-800',
                totalSeat: 54,
                planeCode: 'B-737-800',
                airline: 'Air Asia',
                baggage: 4,
                cabinBaggage: 14,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Jet Air 10',
                totalSeat: 60,
                planeCode: 'JT-210',
                airline: 'Air Asia',
                baggage: 5,
                cabinBaggage: 15,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Boeing 747-400',
                totalSeat: 48,
                planeCode: 'B-747-400',
                airline: 'Air Asia',
                baggage: 3,
                cabinBaggage: 13,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Jet Air 11',
                totalSeat: 72,
                planeCode: 'JT-211',
                airline: 'Air Asia',
                baggage: 8,
                cabinBaggage: 20,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Boeing 777-200',
                totalSeat: 42,
                planeCode: 'B-777-200',
                airline: 'Air Asia',
                baggage: 2,
                cabinBaggage: 10,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Jet Air 12',
                totalSeat: 66,
                planeCode: 'JT-212',
                airline: 'Air Asia',
                baggage: 7,
                cabinBaggage: 18,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Boeing 787-8',
                totalSeat: 36,
                planeCode: 'B-787-8',
                airline: 'Air Asia',
                baggage: 2,
                cabinBaggage: 8,
                description: "In Flight Entertainment",
            },
            {
                planeName: 'Jet Air 13',
                totalSeat: 60,
                planeCode: 'JT-213',
                airline: 'Air Asia',
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
                    airline: plane.airline,
                    baggage: plane.baggage,
                    cabinBaggage: plane.cabinBaggage,
                    description: plane.description,
                },
            });
            await generateSeats(createdPlane.id, plane.totalSeat);

        }

        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 5800000,
                priceChild: 5200000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 1,
                        arrivalAirportId: 4,
                    }
                }
            }
        });
        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 5900000,
                priceChild: 5300000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 4,
                        arrivalAirportId: 1,
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 6000000,
                priceChild: 5400000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 1,
                        arrivalAirportId: 4,
                    }
                }
            }
        });
        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 6100000,
                priceChild: 5500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 4,
                        arrivalAirportId: 1,
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 6200000,
                priceChild: 5600000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 1,
                        arrivalAirportId: 4,
                    }
                }
            }
        });
        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 6300000,
                priceChild: 5700000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 4,
                        arrivalAirportId: 1,
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 5700000,
                priceChild: 5100000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 1,
                        arrivalAirportId: 4,
                    }
                }
            }
        });
        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 5850000,
                priceChild: 5250000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 4,
                        arrivalAirportId: 1,
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 6100000,
                priceChild: 5500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 1,
                        arrivalAirportId: 4,
                    }
                }
            }
        });
        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 6100000,
                priceChild: 5500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 4,
                        arrivalAirportId: 1,
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 6200000,
                priceChild: 5600000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 1,
                        arrivalAirportId: 4,
                    }
                }
            }
        });
        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 6300000,
                priceChild: 5700000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 4,
                        arrivalAirportId: 1,
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Business',
                priceAdult: 10400000,
                priceChild: 9900000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 1,
                        arrivalAirportId: 2,
                    }
                }
            }
        });
        await prisma.seatClasses.create({
            data: {
                name: 'Business',
                priceAdult: 10500000,
                priceChild: 10000000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 2,
                        arrivalAirportId: 1,
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Business',
                priceAdult: 10600000,
                priceChild: 10100000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 1,
                        arrivalAirportId: 2,
                    }
                }
            }
        });
        await prisma.seatClasses.create({
            data: {
                name: 'Business',
                priceAdult: 10700000,
                priceChild: 10200000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 2,
                        arrivalAirportId: 1,
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Premium Economy',
                priceAdult: 7500000,
                priceChild: 7000000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 1,
                        arrivalAirportId: 3,
                    }
                }
            }
        });
        await prisma.seatClasses.create({
            data: {
                name: 'Premium Economy',
                priceAdult: 7600000,
                priceChild: 7100000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 3,
                        arrivalAirportId: 1,
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'Premium Economy',
                priceAdult: 7700000,
                priceChild: 7200000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 1,
                        arrivalAirportId: 3,
                    }
                }
            }
        });
        await prisma.seatClasses.create({
            data: {
                name: 'Premium Economy',
                priceAdult: 7800000,
                priceChild: 7300000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 3,
                        arrivalAirportId: 1,
                    }
                }
            }
        });

        await prisma.seatClasses.create({
            data: {
                name: 'First Class',
                priceAdult: 16000000,
                priceChild: 15000000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 1,
                        arrivalAirportId: 6,
                    }
                }
            }
        });
        await prisma.seatClasses.create({
            data: {
                name: 'First Class',
                priceAdult: 16200000,
                priceChild: 15200000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 6,
                        arrivalAirportId: 1,
                    }
                }
            }
        });

        // Economy - Random Routes
        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 6000000,
                priceChild: 5500000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 2, // Bangkok
                        arrivalAirportId: 3,  // Sydney
                    }
                }
            }
        });
        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 6200000,
                priceChild: 5800000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 5, // Cairo
                        arrivalAirportId: 7,  // London
                    }
                }
            }
        });
        await prisma.seatClasses.create({
            data: {
                name: 'Economy',
                priceAdult: 6700000,
                priceChild: 6300000,
                priceBaby: 0,
                route: {
                    create: {
                        departureAirportId: 3, // Sydney
                        arrivalAirportId: 10, // Los Angeles
                    }
                }
            }
        });


        const promoData = [
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/melbourne.jpg',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-15T23:59:59.000'),
                discount: 75000,
            },
            {
                promotionName: 'Exclusive',
                localImagePath: './prisma/images/jkt.jpg',
                startDate: new Date('2024-12-02T00:00:00.000'),
                endDate: new Date('2024-12-20T23:59:59.000'),
                discount: 950000,
            },
            {
                promotionName: 'Holiday Offer',
                localImagePath: './prisma/images/melbourne.jpg',
                startDate: new Date('2024-12-03T00:00:00.000'),
                endDate: new Date('2024-12-25T23:59:59.000'),
                discount: 120000,
            },
            {
                promotionName: 'Festive Deal',
                localImagePath: './prisma/images/jkt.jpg',
                startDate: new Date('2024-12-05T00:00:00.000'),
                endDate: new Date('2024-12-31T23:59:59.000'),
                discount: 450000,
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/melbourne.jpg',
                startDate: new Date('2024-12-10T00:00:00.000'),
                endDate: new Date('2025-01-01T23:59:59.000'),
                discount: 60000,
            },
            {
                promotionName: 'Flash Sale',
                localImagePath: './prisma/images/jkt.jpg',
                startDate: new Date('2024-12-12T00:00:00.000'),
                endDate: new Date('2024-12-22T23:59:59.000'),
                discount: 850000,
            },
            {
                promotionName: 'Year-End Sale',
                localImagePath: './prisma/images/melbourne.jpg',
                startDate: new Date('2024-12-15T00:00:00.000'),
                endDate: new Date('2025-01-05T23:59:59.000'),
                discount: 50000,
            },
            {
                promotionName: 'Holiday Deal',
                localImagePath: './prisma/images/jkt.jpg',
                startDate: new Date('2024-12-17T00:00:00.000'),
                endDate: new Date('2024-12-27T23:59:59.000'),
                discount: 700000,
            },
            {
                promotionName: 'Christmas Special',
                localImagePath: './prisma/images/melbourne.jpg',
                startDate: new Date('2024-12-20T00:00:00.000'),
                endDate: new Date('2024-12-30T23:59:59.000'),
                discount: 65000,
            },
            {
                promotionName: 'New Year Offer',
                localImagePath: './prisma/images/jkt.jpg',
                startDate: new Date('2024-12-23T00:00:00.000'),
                endDate: new Date('2025-01-03T23:59:59.000'),
                discount: 950000,
            },
            {
                promotionName: 'Winter Special',
                localImagePath: './prisma/images/melbourne.jpg',
                startDate: new Date('2024-12-26T00:00:00.000'),
                endDate: new Date('2025-01-15T23:59:59.000'),
                discount: 55000,
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/jkt.jpg',
                startDate: new Date('2024-12-28T00:00:00.000'),
                endDate: new Date('2025-01-10T23:59:59.000'),
                discount: 800000,
            },
            {
                promotionName: 'Bangkok Bonus',
                localImagePath: './prisma/images/bangkok.png',
                startDate: new Date('2024-12-01T00:00:00.000'),
                endDate: new Date('2024-12-20T23:59:59.000'),
                discount: 110000,
            },
            {
                promotionName: 'Festive Joy',
                localImagePath: './prisma/images/jkt.jpg',
                startDate: new Date('2024-12-04T00:00:00.000'),
                endDate: new Date('2024-12-24T23:59:59.000'),
                discount: 125000,
            },
            {
                promotionName: 'Bangkok Delight',
                localImagePath: './prisma/images/bangkok.png',
                startDate: new Date('2024-12-05T00:00:00.000'),
                endDate: new Date('2024-12-22T23:59:59.000'),
                discount: 135000,
            },
            {
                promotionName: 'Holiday Surprise',
                localImagePath: './prisma/images/jkt.jpg',
                startDate: new Date('2024-12-07T00:00:00.000'),
                endDate: new Date('2024-12-28T23:59:59.000'),
                discount: 100000,
            },
            {
                promotionName: 'Sydney Sojourn',
                localImagePath: './prisma/images/sydney.png',
                startDate: new Date('2024-12-03T00:00:00.000'),
                endDate: new Date('2024-12-23T23:59:59.000'),
                discount: 115000,
            },
            {
                promotionName: 'Exclusive',
                localImagePath: './prisma/images/jkt.jpg',
                startDate: new Date('2024-12-06T00:00:00.000'),
                endDate: new Date('2024-12-30T23:59:59.000'),
                discount: 125000,
            },
            {
                promotionName: 'Sydney Adventure',
                localImagePath: './prisma/images/sydney.png',
                startDate: new Date('2024-12-08T00:00:00.000'),
                endDate: new Date('2024-12-26T23:59:59.000'),
                discount: 130000,
            },
            {
                promotionName: 'Paris Charm',
                localImagePath: './prisma/images/paris.jpg',
                startDate: new Date('2024-12-10T00:00:00.000'),
                endDate: new Date('2024-12-25T23:59:59.000'),
                discount: 145000,
            },
            {
                promotionName: 'Festive Frenzy',
                localImagePath: './prisma/images/jkt.jpg',
                startDate: new Date('2024-12-12T00:00:00.000'),
                endDate: new Date('2024-12-31T23:59:59.000'),
                discount: 100000,
            },
            {
                promotionName: 'limited',
                localImagePath: './prisma/images/london.jpg',
                startDate: new Date('2024-12-15T00:00:00.000'),
                endDate: new Date('2025-01-05T23:59:59.000'),
                discount: 140000,
            },
            {
                promotionName: 'limited',
                localImagePath: './prisma/images/LA.jpg',
                startDate: new Date('2024-12-17T00:00:00.000'),
                endDate: new Date('2025-01-07T23:59:59.000'),
                discount: 155000,
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/london.jpg',
                startDate: new Date('2024-12-15T00:00:00.000'),
                endDate: new Date('2025-01-05T23:59:59.000'),
                discount: 140000,
            },
            {
                promotionName: 'Limited',
                localImagePath: './prisma/images/LA.jpg',
                startDate: new Date('2024-12-17T00:00:00.000'),
                endDate: new Date('2025-01-07T23:59:59.000'),
                discount: 155000,
            },
        ];

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
                    departureTime: new Date('2024-12-01T06:00:00.000'),
                    arrivalTime: new Date('2024-12-01T12:25:00.000'),
                    promotionId: 1,
                    planeId: 1,
                    routeId: 1,
                    duration: generateDuration('2024-12-01T06:00:00.000', '2024-12-01T12:25:00.000'),
                    flightCode: 'Flight-001',
                },
                {
                    departureTime: new Date('2024-12-01T09:00:00.000'),
                    arrivalTime: new Date('2024-12-01T15:25:00.000'),
                    promotionId: 3,
                    planeId: 3,
                    routeId: 3,
                    duration: generateDuration('2024-12-01T09:00:00.000', '2024-12-01T15:25:00.000'),
                    flightCode: 'Flight-003',
                },
                {
                    departureTime: new Date('2024-12-01T11:30:00.000'),
                    arrivalTime: new Date('2024-12-01T17:55:00.000'),
                    promotionId: 5,
                    planeId: 5,
                    routeId: 5,
                    duration: generateDuration('2024-12-01T11:30:00.000', '2024-12-01T17:55:00.000'),
                    flightCode: 'Flight-005',
                },
                {
                    departureTime: new Date('2024-12-01T13:15:00.000'),
                    arrivalTime: new Date('2024-12-01T19:40:00.000'),
                    promotionId: 7,
                    planeId: 7,
                    routeId: 7,
                    duration: generateDuration('2024-12-01T13:15:00.000', '2024-12-01T19:40:00.000'),
                    flightCode: 'Flight-007',
                },
                {
                    departureTime: new Date('2024-12-01T15:00:00.000'),
                    arrivalTime: new Date('2024-12-01T21:25:00.000'),
                    promotionId: 9,
                    planeId: 9,
                    routeId: 9,
                    duration: generateDuration('2024-12-01T15:00:00.000', '2024-12-01T21:25:00.000'),
                    flightCode: 'Flight-009',
                },
                {
                    departureTime: new Date('2024-12-01T16:45:00.000'),
                    arrivalTime: new Date('2024-12-01T23:10:00.000'),
                    promotionId: 11,
                    planeId: 11,
                    routeId: 11,
                    duration: generateDuration('2024-12-01T16:45:00.000', '2024-12-01T23:10:00.000'),
                    flightCode: 'Flight-011',
                },
                {
                    departureTime: new Date('2024-12-04T07:30:00.000'),
                    arrivalTime: new Date('2024-12-04T13:55:00.000'),
                    promotionId: 2,
                    planeId: 2,
                    routeId: 2,
                    duration: generateDuration('2024-12-04T07:30:00.000', '2024-12-04T13:55:00.000'),
                    flightCode: 'Flight-002',
                },
                {
                    departureTime: new Date('2024-12-04T09:00:00.000'),
                    arrivalTime: new Date('2024-12-04T15:25:00.000'),
                    promotionId: 4,
                    planeId: 4,
                    routeId: 4,
                    duration: generateDuration('2024-12-04T09:00:00.000', '2024-12-04T15:25:00.000'),
                    flightCode: 'Flight-004',
                },

                {
                    departureTime: new Date('2024-12-04T15:00:00.000'),
                    arrivalTime: new Date('2024-12-04T21:25:00.000'),
                    promotionId: 6,
                    planeId: 6,
                    routeId: 6,
                    duration: generateDuration('2024-12-04T15:00:00.000', '2024-12-04T21:25:00.000'),
                    flightCode: 'Flight-006',
                },
                {
                    departureTime: new Date('2024-12-04T11:15:00.000'),
                    arrivalTime: new Date('2024-12-04T17:40:00.000'),
                    promotionId: 8,
                    planeId: 8,
                    routeId: 8,
                    duration: generateDuration('2024-12-04T11:15:00.000', '2024-12-04T17:40:00.000'),
                    flightCode: 'Flight-008',
                },
                {
                    departureTime: new Date('2024-12-04T13:45:00.000'),
                    arrivalTime: new Date('2024-12-04T20:10:00.000'),
                    promotionId: 10,
                    planeId: 10,
                    routeId: 10,
                    duration: generateDuration('2024-12-04T13:45:00.000', '2024-12-04T20:10:00.000'),
                    flightCode: 'Flight-010',
                },
                {
                    departureTime: new Date('2024-12-04T15:30:00.000'),
                    arrivalTime: new Date('2024-12-04T21:55:00.000'),
                    promotionId: 12,
                    planeId: 12,
                    routeId: 12,
                    duration: generateDuration('2024-12-04T15:30:00.000', '2024-12-04T21:55:00.000'),
                    flightCode: 'Flight-012',
                },
                {
                    departureTime: new Date('2024-12-02T08:30:00.000'),
                    arrivalTime: new Date('2024-12-02T12:30:00.000'),
                    promotionId: 13,
                    planeId: 13,
                    routeId: 13,
                    duration: generateDuration('2024-12-02T08:30:00.000', '2024-12-02T12:30:00.000'),
                    flightCode: 'Flight-013',
                },
                {
                    departureTime: new Date('2024-12-02T12:15:00.000'),
                    arrivalTime: new Date('2024-12-02T15:45:00.000'),
                    promotionId: 15,
                    planeId: 15,
                    routeId: 15,
                    duration: generateDuration('2024-12-02T12:15:00.000', '2024-12-02T15:45:00.000'),
                    flightCode: 'Flight-015',
                },
                {
                    departureTime: new Date('2024-12-05T13:00:00.000'),
                    arrivalTime: new Date('2024-12-05T15:30:00.000'),
                    promotionId: 14,
                    planeId: 14,
                    routeId: 14,
                    duration: generateDuration('2024-12-05T13:00:00.000', '2024-12-05T15:30:00.000'),
                    flightCode: 'Flight-014',
                },
                {
                    departureTime: new Date('2024-12-05T09:30:00.000'),
                    arrivalTime: new Date('2024-12-05T13:00:00.000'),
                    promotionId: 16,
                    planeId: 16,
                    routeId: 16,
                    duration: generateDuration('2024-12-05T09:30:00.000', '2024-12-05T13:00:00.000'),
                    flightCode: 'Flight-016',
                },
                {
                    departureTime: new Date('2024-12-03T08:15:00.000'),
                    arrivalTime: new Date('2024-12-03T15:15:00.000'),
                    promotionId: 17,
                    planeId: 17,
                    routeId: 17,
                    duration: generateDuration('2024-12-03T08:15:00.000', '2024-12-03T15:15:00.000'),
                    flightCode: 'Flight-017',
                },
                {
                    departureTime: new Date('2024-12-03T09:45:00.000'),
                    arrivalTime: new Date('2024-12-03T16:45:00.000'),
                    promotionId: 19,
                    planeId: 19,
                    routeId: 19,
                    duration: generateDuration('2024-12-03T09:45:00.000', '2024-12-03T16:45:00.000'),
                    flightCode: 'Flight-019',
                },
                {
                    departureTime: new Date('2024-12-06T13:00:00.000'),
                    arrivalTime: new Date('2024-12-06T20:00:00.000'),
                    promotionId: 18,
                    planeId: 18,
                    routeId: 18,
                    duration: generateDuration('2024-12-06T13:00:00.000', '2024-12-06T20:00:00.000'),
                    flightCode: 'Flight-018',
                },
                {
                    departureTime: new Date('2024-12-06T11:30:00.000'),
                    arrivalTime: new Date('2024-12-06T18:30:00.000'),
                    promotionId: 20,
                    planeId: 20,
                    routeId: 20,
                    duration: generateDuration('2024-12-06T11:30:00.000', '2024-12-06T18:30:00.000'),
                    flightCode: 'Flight-020',
                },

                {
                    departureTime: new Date('2024-12-04T08:00:00.000'),
                    arrivalTime: new Date('2024-12-05T00:35:00.000'),
                    promotionId: 21,
                    planeId: 21,
                    routeId: 21,
                    duration: generateDuration('2024-12-04T08:00:00.000', '2024-12-05T00:35:00.000'),
                    flightCode: 'Flight-021',
                },

                {
                    departureTime: new Date('2024-12-08T09:15:00.000'),
                    arrivalTime: new Date('2024-12-09T01:50:00.000'),
                    promotionId: 22,
                    planeId: 22,
                    routeId: 22,
                    duration: generateDuration('2024-12-08T09:15:00.000', '2024-12-09T01:50:00.000'),
                    flightCode: 'Flight-022',
                },
                {
                    departureTime: new Date('2024-12-08T09:15:00.000'),
                    arrivalTime: new Date('2024-12-08T18:40:00.000'),
                    promotionId: 23,
                    planeId: 23,
                    routeId: 23,
                    duration: generateDuration('2024-12-08T09:15:00.000', '2024-12-08T18:40:00.000'),
                    flightCode: 'Flight-023',
                },
                {
                    departureTime: new Date('2024-12-09T08:15:00.000'),
                    arrivalTime: new Date('2024-12-09T13:40:00.000'),
                    promotionId: 24,
                    planeId: 24,
                    routeId: 24,
                    duration: generateDuration('2024-12-09T08:15:00.000', '2024-12-09T13:40:00.000'),
                    flightCode: 'Flight-024',
                },
                {
                    departureTime: new Date('2024-12-09T08:10:00.000'),
                    arrivalTime: new Date('2024-12-09T22:00:00.000'),
                    promotionId: 25,
                    planeId: 25,
                    routeId: 25,
                    duration: generateDuration('2024-12-09T08:10:00.000', '2024-12-09T22:00:00.000'),
                    flightCode: 'Flight-025',
                },
            ],
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