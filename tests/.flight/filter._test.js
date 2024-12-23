const request = require("supertest");
const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

describe("Integration Test for Flight", () => {
  let departureAirportId, arrivalAirportId;

  beforeAll(async () => {
    // Set up mock data in the database
    const departureAirport = await prisma.airports.create({
      data: {
        airportCode: "TST1",
        name: "Test1 International Airport",
        city: "test1",
        country: "Testing1",
        continent: "Data Testing",
      },
    });

    const arrivalAirport = await prisma.airports.create({
      data: {
        airportCode: "TST2",
        name: "Test2 International Airport",
        city: "Denpasar",
        country: "Testing2",
        continent: "Data Testing",
      },
    });

    departureAirportId = departureAirport.id;
    arrivalAirportId = arrivalAirport.id;

    const seatClass = await prisma.seatClasses.create({
      data: {
        name: "Testing Ekonomi",
        priceAdult: 500000,
        priceChild: 300000,
        priceBaby: 150000,
      },
    });

    const route = await prisma.routes.create({
      data: {
        departureAirportId: departureAirport.id,
        arrivalAirportId: arrivalAirport.id,
        seatClassId: seatClass.id, // Linking to seatClass
      },
    });

    const plane = await prisma.planes.create({
      data: {
        planeName: "Boeing 123",
        totalSeat: 150,
        planeCode: "TES",
        description: "Economy Class",
        baggage: 20,
        cabinBaggage: 5,
        airline: "Testing Air",
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
    const flight = await prisma.flights.create({
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
    await prisma.flights.deleteMany({
      where: {
        flightCode: "FL1234",
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

    await prisma.seatClasses.deleteMany({
      where: {
        name: "Testing Ekonomi",
      },
    });

    await prisma.planes.deleteMany({
      where: {
        planeCode: "TES",
      },
    });

    await prisma.$disconnect();
  });

  describe("GET /filter-flight", () => {
    it("Should retrieve flights sorted by price", async () => {
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

    it("Should return error for invalid sortBy or order", async () => {
      const res = await request(app).get("/filter-flight").query({
        sortBy: "invalidSort",
        order: "asc",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid sortBy or order value");
    });

    it("Should retrieve flights sorted by duration", async () => {
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

    it("Should retrieve flights with specific page and limit", async () => {
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

  describe("GET /filter-baggage", () => {
    it("should return planes with exact baggage weight", async () => {
      const response = await request(app).get("/filter-baggage").query({
        page: 1,
        limit: 10,
        baggage: 20, // Example baggage weight
        order: "asc",
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should return an error for invalid baggage weight", async () => {
      const response = await request(app).get("/filter-baggage").query({
        page: 1,
        limit: 10,
        baggage: "invalid", // Invalid baggage value
        order: "asc",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Baggage query must be a valid number"
      );
    });
  });

  describe("GET /filter-cabin-baggage", () => {
    it("should return planes with exact cabin baggage weight", async () => {
      const response = await request(app).get("/filter-cabin-baggage").query({
        page: 1,
        limit: 10,
        cabinBaggage: 5, // Example cabin baggage weight
        order: "asc",
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should return an error for invalid cabin baggage weight", async () => {
      const response = await request(app).get("/filter-cabin-baggage").query({
        page: 1,
        limit: 10,
        cabinBaggage: "invalid", // Invalid cabin baggage value
        order: "asc",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Baggage query must be a valid number"
      );
    });
  });

  describe("GET /filter-desc", () => {
    it("should return planes matching the description", async () => {
      const response = await request(app).get("/filter-desc").query({
        page: 1,
        limit: 10,
        description: "Economy Class", // Example description
        order: "asc",
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should return an error for invalid description", async () => {
      const response = await request(app).get("/filter-desc").query({
        page: 1,
        limit: 10,
        description: "", // Empty description
        order: "asc",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Description query must be a valid string"
      );
    });
  });
});
