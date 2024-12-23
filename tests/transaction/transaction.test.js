const request = require("supertest");
const app = require("../../app");

describe("Testing for Transaction History Route", () => {
	describe("GET /transaction-history", () => {
		test("It Should Return 200 when User Already Login", async () => {
			const login = await request(app).post("/login").send({
				email: "john@mai.com",
				password: "password",
			});

			const authToken = login.body.accessToken;

			const history = await request(app)
				.get("/transaction-history")
				.set("Authorization", `Bearer ${authToken}`);
            
            expect(history.body).toHaveProperty("status");
			expect(history.body).toHaveProperty("statusCode");
			expect(history.body).toHaveProperty("message");
			expect(history.body).toHaveProperty("data");
            expect(history.statusCode).toBe(200);
            expect(history.body.status).toBe("Success");
			expect(history.body.message).toBe("Flight transaction history retrieved successfully");
		});
        test("It Should Return 401 when User Hasnt Login", async () => {
            const history = await request(app)
				.get("/transaction-history")
            
            expect(history.body).toHaveProperty("status");
            expect(history.body).toHaveProperty("statusCode");
            expect(history.body).toHaveProperty("message");
            expect(history.statusCode).toBe(401);
            expect(history.body.status).toBe("Failed");
            expect(history.body.message).toBe("Unauthorized Page!");
        })
	});
});