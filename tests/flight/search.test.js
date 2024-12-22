const request = require("supertest");
const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    airports: {
      findMany: jest.fn(),
    },
    flights: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe("GET /search-flights", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const queryParameters = {
    departureAirportCode: "XYZ",
    arrivalAirportCode: "DPS",
    departureTime: "2024-12-21",
    seatClasses: "economy",
    adultPassenger: 1,
    childPassenger: 0,
    babyPassenger: 0,
  };

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app).get("/search-flights").query({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Please provide all required fields");
  });

  it("should return 400 if input data types are invalid", async () => {
    const invalidQuery = {
      ...queryParameters,
      departureAirportCode: 123,
      seatClasses: 456,
      adultPassenger: "one",
    };
    const res = await request(app).get("/search-flights").query(invalidQuery);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid input data");
  });

  it("should return 404 if departure airport is not found", async () => {
    prisma.airports.findMany.mockResolvedValueOnce([]);
    const res = await request(app)
      .get("/search-flights")
      .query(queryParameters);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Airport not found");
  });

  it("should return 404 if arrival airport is not found", async () => {
    prisma.airports.findMany
      .mockResolvedValueOnce([{ id: 1, airportCode: "XYZ" }])
      .mockResolvedValueOnce([]);

    const res = await request(app)
      .get("/search-flights")
      .query(queryParameters);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Airport not found");
  });

  it("should return 404 if no flights are available", async () => {
    prisma.airports.findMany
      .mockResolvedValueOnce([{ id: 1, airportCode: "XYZ" }])
      .mockResolvedValueOnce([{ id: 2, airportCode: "DPS" }]);
    prisma.flights.findMany.mockResolvedValueOnce([]);

    const res = await request(app)
      .get("/search-flights")
      .query(queryParameters);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      "No flights available for the given criteria"
    );
  });

  it("should return 200 with flights data if valid request", async () => {
    prisma.airports.findMany
      .mockResolvedValueOnce([{ id: 1, airportCode: "XYZ" }])
      .mockResolvedValueOnce([{ id: 2, airportCode: "DPS" }]);
    prisma.flights.findMany.mockResolvedValueOnce([
      {
        id: 1,
        departureTime: "2024-12-21T08:00:00.000Z",
        arrivalTime: "2024-12-21T10:00:00.000Z",
        flightCode: "FL123",
        duration: 120,
        route: {
          id: 1,
          departureAirport: 1,
          arrivalAirport: 2,
          seatClass: {
            name: "economy",
            priceAdult: 100,
          },
        },
        plane: {
          id: 1,
          name: "Boeing 737",
          planeCode: "B737",
          description: "A reliable aircraft",
          baggage: 20,
          cabinBaggage: 7,
          seats: [{ isAvailable: true }],
        },
      },
    ]);
    prisma.flights.count.mockResolvedValueOnce(1);

    const res = await request(app)
      .get("/search-flights")
      .query(queryParameters);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Flights retrieved successfully");
    expect(res.body.flights).toHaveLength(1);
  });
});
