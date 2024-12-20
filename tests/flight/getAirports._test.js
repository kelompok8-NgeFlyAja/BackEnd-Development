const request = require("supertest");
const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

beforeAll(async () => {
  // Pastikan database kosong sebelum testing
  await prisma.airports.deleteMany();
});

afterAll(async () => {
  // Tutup koneksi Prisma setelah testing selesai
  await prisma.$disconnect();
});

describe("Airport Controller Integration Tests", () => {
  describe("POST /add-airport", () => {
    it("should create a new airport successfully", async () => {
      const newAirport = await request(app).post("/add-airport").send({
        name: "Test Airport",
        city: "Test City",
        country: "Test Country",
        continent: "Test Continent",
        airportCode: "TST123",
      });

      expect(newAirport.body).toHaveProperty("statusCode");
      expect(newAirport.statusCode).toBe(201);
      expect(newAirport.body).toHaveProperty("status");
      expect(newAirport.body.status).toBe("success");
      expect(newAirport.body).toHaveProperty("message");
      expect(newAirport.body.message).toBe("Airport added successfully");
      const { id, ...expectedData } = newAirport.body.data;
      expect(newAirport.body.data).toMatchObject(expectedData);
    });

    it("should return 400 if required fields are missing", async () => {
      const incompleteAirport = await request(app).post("/add-airport").send({
        name: "Test Airport",
        city: "Test City",
      });

      expect(incompleteAirport.body).toHaveProperty("statusCode");
      expect(incompleteAirport.statusCode).toBe(400);
      expect(incompleteAirport.body).toHaveProperty("status");
      expect(incompleteAirport.body.status).toBe("failed");
      expect(incompleteAirport.body).toHaveProperty("message");
      expect(incompleteAirport.body.message).toBe(
        "Please provide all required fields"
      );
    });

    it("should return 400 if input data is invalid", async () => {
      const invalidAirport = await request(app).post("/add-airport").send({
        name: 123,
        city: "Test City",
        country: 132342,
        continent: "Test Continent",
        airportCode: "TST123",
      });

      expect(invalidAirport.body).toHaveProperty("statusCode");
      expect(invalidAirport.statusCode).toBe(400);
      expect(invalidAirport.body).toHaveProperty("status");
      expect(invalidAirport.body.status).toBe("failed");
      expect(invalidAirport.body).toHaveProperty("message");
      expect(invalidAirport.body.message).toBe("Invalid input data");
    });
  });

  describe("GET /get-airports", () => {
    it("should fetch all airports successfully", async () => {
      const res = await request(app).get("/get-airports");

      expect(res.body).toHaveProperty("statusCode");
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toBe("success");
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("All Airport");
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("DELETE /delete-airport/:id", () => {
    it("should delete an airport successfully", async () => {
      let airportId;
      // Buat airport baru untuk dihapus
      const airport = await prisma.airports.create({
        data: {
          name: "Delete Test Airport",
          city: "Delete City",
          country: "Delete Country",
          continent: "Delete Continent",
          airportCode: "DEL123",
        },
      });
      airportId = airport.id;
      const deleteAirport = await request(app)
        .delete(`/delete-airport/${airport.id}`)
        .send();

      expect(deleteAirport.body).toHaveProperty("statusCode");
      expect(deleteAirport.statusCode).toBe(200);
      expect(deleteAirport.body).toHaveProperty("status");
      expect(deleteAirport.body.status).toBe("success");
      expect(deleteAirport.body).toHaveProperty("message");
      expect(deleteAirport.body.message).toBe("Airport deleted successfully");
      expect(deleteAirport.body.data).toMatchObject({
        id: airportId,
        name: "Delete Test Airport",
        city: "Delete City",
        country: "Delete Country",
        continent: "Delete Continent",
        airportCode: "DEL123",
      });
    });

    // it("should return 400 if no ID is provided", async () => {
    //   const response = await request(app)
    //     .delete(`/delete-airport/`) // Tanpa ID
    //     .send();

    //   expect(response.body).toHaveProperty("statusCode");
    //   expect(response.statusCode).toBe(400);
    //   expect(response.body).toHaveProperty("status");
    //   expect(response.body.status).toBe("failed");
    //   expect(response.body).toHaveProperty("message");
    //   expect(response.body.message).toBe("Please provide an ID");
    // });

    it("should return 404 if airport does not exist", async () => {
      const byId = await request(app).delete("/delete-airport/99999").send(); // id yang tidak ada

      expect(byId.body).toHaveProperty("statusCode");
      expect(byId.statusCode).toBe(404);
      expect(byId.body).toHaveProperty("status");
      expect(byId.body.status).toBe("failed");
      expect(byId.body).toHaveProperty("message");
      expect(byId.body.message).toBe("Airport not found");
    });
  });

  describe("POST /add-airports", () => {
    it("should add multiple airports successfully", async () => {
      const airports = [
        {
          name: "Bulk Airport 1",
          city: "Bulk City 1",
          country: "Bulk Country 1",
          continent: "Bulk Continent 1",
          airportCode: "BLK001",
        },
        {
          name: "Bulk Airport 2",
          city: "Bulk City 2",
          country: "Bulk Country 2",
          continent: "Bulk Continent 2",
          airportCode: "BLK002",
        },
      ];

      const res = await request(app).post("/add-airports").send(airports);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "Airports added successfully");
      expect(res.body.airports).toBeDefined();
      expect(res.body.airports.count).toBeGreaterThan(0);
    });

    it("should return 400 if all input data is invalid", async () => {
      const invalidAirports = [
        {
          name: "",
          city: "",
          country: "",
          continent: "",
          airportCode: "",
        },
      ];

      const res = await request(app)
        .post("/add-airports")
        .send(invalidAirports);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid input data");
    });

    it("should return 400 if no data is provided", async () => {
      const res = await request(app).post("/add-airports").send([]);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "No data provided");
    });

    it("should return 400 if input data is invalid", async () => {
      const invalidAirports = [
        {
          name: "Invalid Bulk Airport",
          city: "Bulk City",
          country: "Bulk Country",
          airportCode: "BLK003", // Missing "continent"
        },
      ];

      const res = await request(app)
        .post("/add-airports")
        .send(invalidAirports);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid input data");
    });
  });
});
