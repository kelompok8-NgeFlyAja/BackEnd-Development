const request = require("supertest");
const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

let authToken;

beforeAll(async () => {
	const login = await request(app).post("/login").send({
		email: "john@mail.com",
		password: "password",
	});

	authToken = login.body.accessToken;
});

describe("Testing for PDF Route", () => {
    describe("GET /print-pdf/:bookingId", () => {
        test("It should return 200 when the booking is found", async () => {
            const bookingId = 54309057;
            const response = await request(app)
                .get(`/print-pdf/${bookingId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
        });
        test("It should return 404 when the booking is not found", async () => {
            const nonExistentBookingId = 99999;
            const response = await request(app)
                .get(`/print-pdf/${nonExistentBookingId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("status", "error");
            expect(response.body).toHaveProperty("message", "Booking not found");
        });
    });
    describe("GET /download-pdf/:bookingId", () => {
        test("It should return 200 when the booking is found", async () => {
            const bookingId = 54309057;
            const response = await request(app)
                .get(`/download-pdf/${bookingId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
        });

        test("It should return 404 when the booking is not found", async () => {
            const nonExistentBookingId = 99999;
            const response = await request(app)
                .get(`/download-pdf/${nonExistentBookingId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("status", "error");
            expect(response.body).toHaveProperty("message", "Booking not found");
        });
    });
})
