const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const app = require("../../app"); // Sesuaikan dengan path ke aplikasi Express Anda

let departureAirportId;
let arrivalAirportId;

beforeAll(async () => {
  // Hapus data yang sudah ada sebelumnya
  await prisma.flights.deleteMany({});
  await prisma.routes.deleteMany({});
  await prisma.promotions.deleteMany({});
  await prisma.airports.deleteMany({});
  await prisma.seatClasses.deleteMany({});

  // Seed data untuk tes
  const departureAirport = await prisma.airports.create({
    data: {
      city: "Jakarta",
      name: "Soekarno-Hatta International Airport",
      country: "Indonesia",
      continent: "Asia",
      airportCode: "CGK",
    },
  });

  const arrivalAirport = await prisma.airports.create({
    data: {
      city: "Bali",
      name: "Ngurah Rai International Airport",
      country: "Indonesia",
      continent: "Asia",
      airportCode: "DPS",
    },
  });

  departureAirportId = departureAirport.id; // Store the id for later use
  arrivalAirportId = arrivalAirport.id; // Store the id for later use

  const seatClass = await prisma.seatClasses.create({
    data: {
      name: "Economy",
      priceAdult: 500000,
      priceChild: 200000,
      priceBaby: 0,
    },
  });

  const promotion = await prisma.promotions.create({
    data: {
      promotionName: "Holiday Discount",
      discount: 100000,
      image: "http://example.com/promotion.jpg",
      startDate: new Date(),
      endDate: new Date(),
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
          flightCode: "FL1234",
          plane: {
            create: {
              planeName: "Boeing 737",
              totalSeat: 180,
              planeCode: "B737",
              description:
                "Boeing 737 adalah pesawat jet komersial yang digunakan untuk penerbangan jarak pendek dan menengah.",
              baggage: 20,
              cabinBaggage: 10,
            },
          },
        },
      },
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /favorite-destination", () => {
  it("should return flight cards with the correct data", async () => {
    const response = await request(app).get("/favorite-destination");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveLength(1); // Sesuaikan dengan jumlah data yang diharapkan
    expect(response.body.data[0]).toHaveProperty("departure", "Jakarta");
    expect(response.body.data[0]).toHaveProperty("arrival", "Bali");
    expect(response.body.data[0]).toHaveProperty("price", 400000); // 500000 - 100000 discount
    expect(response.body.data[0]).toHaveProperty(
      "imageUrl",
      "http://example.com/promotion.jpg"
    );
    expect(response.body.data[0]).toHaveProperty("label", "Holiday Discount");
  });

  it("should return 400 for invalid page and limit parameters", async () => {
    const response = await request(app).get(
      "/favorite-destination?page=invalid&limit=invalid"
    );

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("error");
  });
});
