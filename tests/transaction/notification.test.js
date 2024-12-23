const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const password = process.env.PASSWORD_SALT;
const salt = parseInt(process.env.SALT);
const hashedPassword = bcrypt.hashSync(password, salt);

let authToken;

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
        email: "john@mail.com",
        password: "password",
    });

    authToken = login.body.accessToken;
	console.log(authToken, '-> from before');
	
});

afterAll(async () => {
	await prisma.users.deleteMany({
		where: {
			email: "test@gmail.com",
		},
	});

	await prisma.$disconnect();
});

describe("Testing for Notification Route", () => {
	describe("GET /notifications", () => {
		test("It Should Return 200 and the list of notifications of the user", async () => {
			const notif = await request(app)
				.get("/notifications")
				.set("Authorization", `Bearer ${authToken}`);

			expect(notif.body).toHaveProperty("status");
			expect(notif.body).toHaveProperty("message");
			expect(notif.body).toHaveProperty("data");
			expect(notif.statusCode).toBe(200);
			expect(notif.body.status).toBe("success");
			expect(notif.body.message).toBe(
				`Notifications retrieved successfully.`
			);
		});
		test("It Should Return 404 when no notifications are found for the user", async () => {
			const login = await request(app).post("/login").send({
				email: "test@gmail.com",
				password: "password",
			});
			const authTokens = login.body.accessToken
			const response = await request(app)
				.get("/notifications")
				.set("Authorization", `Bearer ${authTokens}`);
	
			expect(response.statusCode).toBe(404);
			expect(response.body).toHaveProperty("status", "error");
			expect(response.body).toHaveProperty(
				"message",
				"No notifications found for the user."
			);
		});
	});
    describe("PUT /notifications/:notificationId", () => {
        test("It should return 200 and a notification when the notification ID is valid and found", async () => {
			const notificationId = 14;
			const notif = await request(app)
				.put(`/notifications/${notificationId}`)
				.set("Authorization", `Bearer ${authToken}`);
			console.log(notif.body, '->notif 200');
			
			expect(notif.body).toHaveProperty("status");
			expect(notif.body).toHaveProperty("message");
			expect(notif.body).toHaveProperty("data");
			expect(notif.statusCode).toBe(200);
			expect(notif.body.status).toBe("success");
			expect(notif.body.message).toBe("Notification retrieved successfully.");
		});
		test("It should return 400 when the notification ID is not a number", async () => {
			const invalidNotificationId = "invalid-id";
			const notif = await request(app)
				.put(`/notifications/${invalidNotificationId}`)
				.set("Authorization", `Bearer ${authToken}`);
			console.log(notif.body, '->notif 400');
	
			expect(notif.statusCode).toBe(400);
			expect(notif.body).toHaveProperty("status", "error");
			expect(notif.body).toHaveProperty(
				"message",
				"Invalid notification ID provided."
			);
		});
		test("It should return 404 when the notification ID does not exist", async () => {
			const nonExistentNotificationId = 999999; 
			const notif = await request(app)
				.put(`/notifications/${nonExistentNotificationId}`)
				.set("Authorization", `Bearer ${authToken}`);
				console.log(notif.body, '->notif 404');
	
			expect(notif.statusCode).toBe(404);
			expect(notif.body).toHaveProperty("status", "error");
			expect(notif.body).toHaveProperty(
				"message",
				"Notification not found."
			);
		});
    })
});
