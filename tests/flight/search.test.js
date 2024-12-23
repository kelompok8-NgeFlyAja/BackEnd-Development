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
    routes: {
      findMany: jest.fn(),
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
    returnTime: "2024-12-25",
    seatClasses: "economy",
    adultPassenger: 1,
    childPassenger: 0,
    babyPassenger: 0,
    page: 1,
    pageSize: 10,
  };

  it("should return 400 if departure and arrival airports are the same", async () => {
    const res = await request(app)
      .get("/search-flights")
      .query({
        ...queryParameters,
        arrivalAirportCode: "XYZ",
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Departure and arrival airport cannot be the same"
    );
  });

  it("should return 400 if date format is invalid", async () => {
    const res = await request(app)
      .get("/search-flights")
      .query({
        ...queryParameters,
        departureTime: "21-12-2024",
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid date format or non-existent date");
  });

  it("should return 404 if route is not found", async () => {
    prisma.airports.findMany
      .mockResolvedValueOnce([{ id: 1, airportCode: "XYZ" }])
      .mockResolvedValueOnce([{ id: 2, airportCode: "DPS" }]);
    prisma.routes.findMany.mockResolvedValueOnce([]);

    const res = await request(app)
      .get("/search-flights")
      .query(queryParameters);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Route not found");
  });

  it("should return 200 with flights data if valid request", async () => {
    prisma.airports.findMany
      .mockResolvedValueOnce([{ id: 1, airportCode: "XYZ" }])
      .mockResolvedValueOnce([{ id: 2, airportCode: "DPS" }]);
    prisma.routes.findMany.mockResolvedValueOnce([
      { id: 1, departureAirportId: 1, arrivalAirportId: 2 },
    ]);
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
    expect(res.body.totalFlights).toBe(1);
    expect(res.body.flights).toHaveLength(1);
    expect(res.body.flights[0].route.departureAirport).toBe(
      queryParameters.departureAirportCode
    );
  });

  // For the returnSearchFlights endpoint
  it("should return 400 if return date format is invalid", async () => {
    const res = await request(app)
      .get("/return-search-flights")
      .query({
        ...queryParameters,
        returnTime: "25-12-2024",
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Invalid return date format or non-existent date"
    );
  });

  it("should return 404 if return route is not found", async () => {
    prisma.airports.findMany
      .mockResolvedValueOnce([{ id: 1, airportCode: "XYZ" }])
      .mockResolvedValueOnce([{ id: 2, airportCode: "DPS" }]);
    prisma.routes.findMany.mockResolvedValueOnce([]);
    const res = await request(app)
      .get("/return-search-flights")
      .query(queryParameters);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Return route not found");
  });

  it("should return 404 if no return flights available", async () => {
    prisma.airports.findMany
      .mockResolvedValueOnce([{ id: 1, airportCode: "XYZ" }])
      .mockResolvedValueOnce([{ id: 2, airportCode: "DPS" }]);
    prisma.routes.findMany.mockResolvedValueOnce([
      { id: 1, departureAirportId: 1, arrivalAirportId: 2 },
    ]);
    prisma.flights.findMany.mockResolvedValueOnce([]);
    const res = await request(app)
      .get("/return-search-flights")
      .query(queryParameters);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      "No return flights available for the given criteria"
    );
  });

  it("should return 200 with return flights data if valid request", async () => {
    prisma.airports.findMany
      .mockResolvedValueOnce([{ id: 1, airportCode: "XYZ" }])
      .mockResolvedValueOnce([{ id: 2, airportCode: "DPS" }]);
    prisma.routes.findMany.mockResolvedValueOnce([
      { id: 1, departureAirportId: 1, arrivalAirportId: 2 },
    ]);
    prisma.flights.findMany.mockResolvedValueOnce([
      {
        id: 2,
        departureTime: "2024-12-25T08:00:00.000Z",
        arrivalTime: "2024-12-25T10:00:00.000Z",
        flightCode: "FL124",
        duration: 120,
        route: {
          id: 2,
          departureAirport: 1,
          arrivalAirport: 2,
          seatClass: {
            name: "economy",
            priceAdult: 100,
          },
        },
        plane: {
          id: 2,
          name: "Airbus A320",
          planeCode: "A320",
          description: "A comfortable aircraft",
          baggage: 25,
          cabinBaggage: 8,
          seats: [{ isAvailable: true }],
        },
      },
    ]);
    prisma.flights.count.mockResolvedValueOnce(1);

    const res = await request(app)
      .get("/return-search-flights")
      .query(queryParameters);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Return flights retrieved successfully");
    expect(res.body.totalReturnFlights).toBe(1);
    expect(res.body.flights).toHaveLength(1);
    expect(res.body.flights[0].route.departureAirport).toBe(
      queryParameters.arrivalAirportCode
    );
  });
});
