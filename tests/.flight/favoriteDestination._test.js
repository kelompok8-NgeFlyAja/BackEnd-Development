const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const app = require("../../app");

let departureAirportId;
let arrivalAirportId;

beforeAll(async () => {
  // Seed data untuk tes
  const departureAirport = await prisma.airports.create({
    data: {
      city: "test1",
      name: "Test1 International Airport",
      country: "Testing1",
      continent: "Data Testing",
      airportCode: "TST1",
    },
  });

  const arrivalAirport = await prisma.airports.create({
    data: {
      city: "test2",
      name: "Test2 International Airport",
      country: "Testing2",
      continent: "Data Testing",
      airportCode: "TST2",
    },
  });

  departureAirportId = departureAirport.id;
  arrivalAirportId = arrivalAirport.id;

  const seatClass = await prisma.seatClasses.create({
    data: {
      name: "Testing Ekonomi",
      priceAdult: 500000,
      priceChild: 200000,
      priceBaby: 0,
    },
  });

  const promotion = await prisma.promotions.create({
    data: {
      promotionName: "Test Discount",
      discount: 100000,
      image: "http://example.com/promotion.jpg",
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const plane = await prisma.planes.create({
    data: {
      planeName: "Boeing 123",
      totalSeat: 180,
      planeCode: "TS123",
      description:
        "Boeing 123 adalah pesawat jet komersial yang digunakan untuk penerbangan jarak pendek dan menengah.",
      airline: "Testing Air",
      baggage: 20,
      cabinBaggage: 10,
    },
  });

  await prisma.routes.create({
    data: {
      departureAirportId: departureAirportId, // Use the correct ID
      arrivalAirportId: arrivalAirportId, // Use the correct ID
      seatClassId: seatClass.id,
      flights: {
        create: {
          promotion: {
            connect: { id: promotion.id },
          },
          duration: "2 hours",
          departureTime: new Date("2024-12-18T10:00:00.000Z"),
          arrivalTime: new Date("2024-12-18T12:00:00.000Z"),
          flightCode: "TST090",
          plane: {
            connect: {
              id: plane.id,
            },
          },
        },
      },
    },
  });
});

afterAll(async () => {
  // Hapus data testing
  await prisma.flights.deleteMany({
    where: {
      flightCode: "TST090",
    },
  });

  await prisma.routes.deleteMany({
    where: {
      departureAirportId: departureAirportId,
      arrivalAirportId: arrivalAirportId,
    },
  });

  await prisma.airports.deleteMany({
    where: {
      airportCode: { in: ["TST1", "TST2"] },
    },
  });

  await prisma.promotions.deleteMany({
    where: {
      promotionName: "Test Discount",
    },
  });

  await prisma.seatClasses.deleteMany({
    where: {
      name: "Testing Ekonomi",
    },
  });

  await prisma.planes.deleteMany({
    where: {
      planeCode: "TS123",
    },
  });

  await prisma.$disconnect();
});

describe("GET /favorite-destination", () => {
  it("should return flight cards with the correct data", async () => {
    const response = await request(app).get("/favorite-destination");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveLength(1); // Sesuaikan dengan jumlah data yang diharapkan
    expect(response.body.data[0]).toHaveProperty("departure", "test1");
    expect(response.body.data[0]).toHaveProperty("arrival", "test2");
    expect(response.body.data[0]).toHaveProperty("price", 400000); // 500000 - 100000 discount
    expect(response.body.data[0]).toHaveProperty(
      "imageUrl",
      "http://example.com/promotion.jpg"
    );
    expect(response.body.data[0]).toHaveProperty("label", "Test Discount");
  });

  it("should return 400 for invalid page and limit parameters", async () => {
    const response = await request(app).get(
      "/favorite-destination?page=invalid&limit=invalid"
    );

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("error");
  });
});
