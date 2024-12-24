const request = require('supertest');
const app = require('../../app');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const password = process.env.PASSWORD_SALT;
const salt = parseInt(process.env.SALT);

const hashedPassword = bcrypt.hashSync(password, salt);

let authToken

beforeAll(async () => {
    await prisma.users.create({
		data: {
			name: "test",
			email: "test@gmail.com",
			phoneNumber: "081212123434",
			password: hashedPassword,
			isActivated: true,
		},
	});

	const login = await request(app).post("/login").send({
		email: "test@gmail.com",
		password: "password",
	});

	authToken = login.body.accessToken;
});

afterAll(async () => {
    await prisma.users.deleteMany({
		where: {
			email: "test@gmail.com",
		},
	});

    await prisma.$disconnect();
})

describe("Testing for User Account Route", () => {
    describe("GET /user", () => {
        test("it should return 200 and the user details when the user exists", async () => {
            const response = await request(app)
                .get("/user")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("status", "Success");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("name");
            expect(response.body.data).toHaveProperty("phoneNumber");
            expect(response.body.data).toHaveProperty("email");
        });
    });
    describe("PUT /user", () => {
        test("it should return 200 and update user details successfully", async () => {
            
            const response = await request(app)
                .put("/update-user")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "test baru lagi",
                    phoneNumber: "1234567890",
                    email: "test@gmail.com",
                });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("status", "Success");
            expect(response.body).toHaveProperty("message", "User updated successfully");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("name", "test baru lagi");
            expect(response.body.data).toHaveProperty("phoneNumber", "1234567890");
            expect(response.body.data).toHaveProperty("email", "test@gmail.com");
        });
        test("it should return 400 when no fields are provided to update", async () => {
            const response = await request(app)
                .put("/update-user")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "",
                    phoneNumber: "",
                    email: "",
                });

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("status", "Failed");
            expect(response.body.message).toBe("At least one field is required to update.");
        });
    });
})