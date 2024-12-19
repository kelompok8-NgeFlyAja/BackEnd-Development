const request = require("supertest");
const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

describe("Integration Test for getFilteredFlights", () => {
  let departureAirport, arrivalAirport, seatClass, route, plane, flight;

  beforeAll(async () => {
    // Set up mock data in the database
    departureAirport = await prisma.airports.create({
      data: {
        airportCode: "cgk",
        name: "Soekarno-Hatta",
        city: "Jakarta",
        country: "Indonesia",
        continent: "Asia",
      },
    });

    arrivalAirport = await prisma.airports.create({
      data: {
        airportCode: "dps",
        name: "Ngurah Rai",
        city: "Denpasar",
        country: "Indonesia",
        continent: "Asia",
      },
    });

    seatClass = await prisma.seatClasses.create({
      data: {
        name: "economy",
        priceAdult: 500000,
        priceChild: 300000,
        priceBaby: 150000,
      },
    });

    route = await prisma.routes.create({
      data: {
        departureAirportId: departureAirport.id,
        arrivalAirportId: arrivalAirport.id,
        seatClassId: seatClass.id, // Linking to seatClass
      },
    });

    plane = await prisma.planes.create({
      data: {
        planeName: "Boeing 737",
        totalSeat: 150,
        planeCode: "B737",
        description: "Economy Class",
        baggage: 20,
        cabinBaggage: 5,
        seats: {
          createMany: {
            data: Array.from({ length: 150 }, (_, i) => ({
              seatNumber: (i + 1).toString(), // Convert seatNumber to string
              isAvailable: true,
            })),
          },
        },
      },
    });

    // Create a flight, making sure the necessary foreign keys exist
    flight = await prisma.flights.create({
      data: {
        routeId: route.id, // Linking to the route
        planeId: plane.id, // Linking to the plane
        duration: "2 hours",
        departureTime: new Date("2024-12-20T09:00:00Z"),
        arrivalTime: new Date("2024-12-20T12:00:00Z"),
        flightCode: "FL1234",
      },
    });
  });

  afterAll(async () => {
    // Clean up the database
    await prisma.flights.deleteMany();
    await prisma.routes.deleteMany();
    await prisma.planes.deleteMany();
    await prisma.airports.deleteMany();
    await prisma.seatClasses.deleteMany();
    await prisma.$disconnect();
  });

  test("Should retrieve flights sorted by price", async () => {
    const res = await request(app).get("/filter-flight").query({
      page: "1",
      limit: "10",
      sortBy: "price",
      order: "asc",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0]).toMatchObject({
      flightCode: "FL1234",
      duration: "2 hours",
    });
  });

  test("Should return error for invalid sortBy or order", async () => {
    const res = await request(app).get("/filter-flight").query({
      sortBy: "invalidSort",
      order: "asc",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid sortBy or order value");
  });

  test("Should retrieve flights sorted by duration", async () => {
    const res = await request(app).get("/filter-flight").query({
      page: "1",
      limit: "10",
      sortBy: "duration",
      order: "asc",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0].duration).toBe("2h 0m");
  });

  test("Should retrieve flights with specific page and limit", async () => {
    const res = await request(app).get("/filter-flight").query({
      page: "1",
      limit: "5",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
    expect(res.body.totalCount).toBeGreaterThan(0);
  });
});
