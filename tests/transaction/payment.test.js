const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const password = process.env.PASSWORD_SALT;
const salt = parseInt(process.env.SALT);

const hashedPassword = bcrypt.hashSync(password, salt);

let authToken, bookingId;

const booking = {
	bookingTicket: {
		flightId: 25,
		bookerName: "John Test",
		bookerEmail: "test@gmail.com",
		bookerPhone: "081212123434",
	},
	passengerDetail: [
		{
			title: "Mr.",
			fullName: "John Test",
			familyName: "Test",
			birthDate: "1983-06-15",
			nationality: "US",
			identityNumber: "9876543210",
			identityCountry: "US",
			identityExpired: "2025-06-15",
			seatName: "1E",
		},
		{
			title: "Mrs.",
			fullName: "Mary Test",
			familyName: "Test",
			birthDate: "1985-07-15",
			nationality: "US",
			identityNumber: "9876543210",
			identityCountry: "US",
			identityExpired: "2025-06-15",
			seatName: "2E",
		},
		{
			title: "Mr.",
			fullName: "Charlie Test",
			familyName: "Test",
			birthDate: "2002-07-15",
			nationality: "US",
			identityNumber: "9875233210",
			identityCountry: "US",
			identityExpired: "2025-06-15",
			seatName: "3E",
		},
		{
			title: "Mrs.",
			fullName: "Mary Test",
			familyName: "Test",
			birthDate: "2012-07-15",
			nationality: "US",
			identityNumber: "9876139210",
			identityCountry: "US",
			identityExpired: "2025-06-15",
			seatName: "4E",
		},
	],
	adultPassenger: 2,
	childPassenger: 1,
	babyPassenger: 1,
};

beforeEach(async () => {
	await prisma.users.create({
		data: {
			name: "test",
			email: "test2@gmail.com",
			phoneNumber: "081212123434",
			password: hashedPassword,
			isActivated: true,
		},
	});

	const login = await request(app).post("/login").send({
		email: "test2@gmail.com",
		password: "password",
	});

	authToken = login.body.accessToken;

	const ticketBooking = await request(app)
		.post("/ticket-booking")
		.send(booking)
		.set("Authorization", `Bearer ${authToken}`);

	bookingId = ticketBooking.body.bookingId;
});

afterEach(async () => {
	const passengers = await prisma.passengers.findMany({
		where: {
			bookingId: bookingId,
		},
		select: {
			seatId: true,
		},
	});

	for (const passenger of passengers) {
		if (passenger.seatId) {
			await prisma.seats.update({
				where: { id: passenger.seatId },
				data: { isAvailable: true },
			});
		}
	}

	await prisma.passengers.deleteMany({
		where: {
			bookingId: bookingId,
		},
	});

	await prisma.bookings.delete({
		where: {
			id: bookingId,
		},
	});

	await prisma.users.deleteMany({
		where: {
			email: "test2@gmail.com",
		},
	});

    await prisma.$disconnect();
});

describe("Testing for Payment Route", () => {
    describe("POST /payment-creditcard/:bookingId", () => {
        test("It Should return 200 when all the payment for Credit Card are Filled", async () => {
            const payment = await request(app)
                .post(`/payment-creditcard/${parseInt(bookingId)}`)
                .send({
                    card_number: "4811111111111114",
                    card_exp_month: "2",
                    card_exp_year: "2025",
                    card_cvv: "123",
                })
                .set("Authorization", `Bearer ${authToken}`);

            expect(payment.body).toHaveProperty("status");
            expect(payment.body).toHaveProperty("statusCode");
            expect(payment.body).toHaveProperty("message");
            expect(payment.statusCode).toBe(200);
            expect(payment.body.status).toBe("success");
            expect(payment.body.message).toBe("Payment Success!");
        });
        test("It Should Return 409 when this Transaction has already been done", async () => {
            const payment = await request(app)
                .post(`/payment-creditcard/3465356`)
                .send({
                    card_number: "4811111111111114",
                    card_exp_month: "2",
                    card_exp_year: "2025",
                    card_cvv: "123",
                })
                .set("Authorization", `Bearer ${authToken}`);

            expect(payment.body).toHaveProperty("status");
            expect(payment.body).toHaveProperty("statusCode");
            expect(payment.body).toHaveProperty("message");
            expect(payment.statusCode).toBe(409);
            expect(payment.body.status).toBe("Failed");
            expect(payment.body.message).toBe(
                "This Transaction Has Already been Finished! Please Make A New One"
            );
        });
        test("It Should Return 400 when any of the field is empty", async () => {
            const payment = await request(app)
                .post(`/payment-creditcard/${parseInt(bookingId)}`)
                .send({
                    card_number: "4811111111111114",
                    card_exp_year: "2025",
                    card_cvv: "123",
                })
                .set("Authorization", `Bearer ${authToken}`);

            expect(payment.body).toHaveProperty("status");
            expect(payment.body).toHaveProperty("statusCode");
            expect(payment.body).toHaveProperty("message");
            expect(payment.statusCode).toBe(400);
            expect(payment.body.status).toBe("Failed");
            expect(payment.body.message).toBe("Card details are required");
        });
        test("It Should Return 401 when The User not login", async () => {
            const payment = await request(app)
                .post(`/payment-creditcard/${bookingId}`)
                .send({
                    card_number: "4811111111111114",
                    card_exp_month: "2",
                    card_exp_year: "2025",
                    card_cvv: "123",
                });

            expect(payment.body).toHaveProperty("status");
            expect(payment.body).toHaveProperty("statusCode");
            expect(payment.body).toHaveProperty("message");
            expect(payment.statusCode).toBe(401);
            expect(payment.body.status).toBe("Failed");
            expect(payment.body.message).toBe("Unauthorized Page!");
        });
        test("It Should Return 400 for invalid card number", async () => {
            const payment = await request(app)
                .post(`/payment-creditcard/${bookingId}`)
                .send({
                    card_number: "1234",
                    card_exp_month: "2",
                    card_exp_year: "2025",
                    card_cvv: "123",
                })
                .set("Authorization", `Bearer ${authToken}`);

            expect(payment.statusCode).toBe(400);
            expect(payment.body.message).toBe(
                "Invalid card_number. It should be a 16-digit number."
            );
        });
        test("It Should Return 400 for invalid expiration month", async () => {
            const payment = await request(app)
                .post(`/payment-creditcard/${bookingId}`)
                .send({
                    card_number: "4811111111111114",
                    card_exp_month: "13",
                    card_exp_year: "2025",
                    card_cvv: "123",
                })
                .set("Authorization", `Bearer ${authToken}`);

            expect(payment.statusCode).toBe(400);
            expect(payment.body.message).toBe(
                "Invalid card_exp_month. It should be a number between 1 and 12."
            );
        });
        test("It Should Return 400 for invalid expiration year", async () => {
            const payment = await request(app)
                .post(`/payment-creditcard/${bookingId}`)
                .send({
                    card_number: "4811111111111114",
                    card_exp_month: "2",
                    card_exp_year: (new Date().getFullYear() - 1).toString(),
                    card_cvv: "123",
                })
                .set("Authorization", `Bearer ${authToken}`);

            expect(payment.statusCode).toBe(400);
            expect(payment.body.message).toBe(
                "Invalid card_exp_year. It should be a valid year."
            );
        });
        test("It Should Return 400 for invalid CVV", async () => {
            const payment = await request(app)
                .post(`/payment-creditcard/${bookingId}`)
                .send({
                    card_number: "4811111111111114",
                    card_exp_month: "2",
                    card_exp_year: "2025",
                    card_cvv: "12",
                })
                .set("Authorization", `Bearer ${authToken}`);

            expect(payment.statusCode).toBe(400);
            expect(payment.body.message).toBe(
                "Invalid card_cvv. It should be a 3-digit number."
            );
        });
        test("It Should Return 400 when booking ID is missing", async () => {
            const payment = await request(app)
                .post(`/payment-creditcard/`)
                .send({
                    card_number: "4811111111111114",
                    card_exp_month: "2",
                    card_exp_year: "2025",
                    card_cvv: "123",
                })
                .set("Authorization", `Bearer ${authToken}`);

            expect(payment.statusCode).toBe(400);
            expect(payment.body.message).toBe("Booking Ticket ID is required");
        });
		test("It Should Return 404 when booking ticket not found", async () => {
			const payment = await request(app)
				.post(`/payment-creditcard/1`)
				.send({
					card_number: "4811111111111114",
					card_exp_month: "2",
					card_exp_year: "2025",
					card_cvv: "123",
				})
				.set("Authorization", `Bearer ${authToken}`);
			
			expect(payment.statusCode).toBe(404);
			expect(payment.body.message).toBe("Booking Ticket not found");
		});
    });

    describe("POST /payment/:bookingId", () => {
        test("It Should Return 201 when all the payment for VA are Filled", async () => {
            const payment = await request(app)
                .post(`/payment/${parseInt(bookingId)}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(payment.body).toHaveProperty("status");
            expect(payment.body).toHaveProperty("statusCode");
            expect(payment.body).toHaveProperty("message");
            expect(payment.body).toHaveProperty("flightDetails");
            expect(payment.body).toHaveProperty("bankDetails");
            expect(payment.statusCode).toBe(201);
            expect(payment.body.status).toBe("Success");
            expect(payment.body.message).toBe(
                "Flight details and payment information retrieved successfully"
            );
        });
        test("It Should Return 409 when this Transaction has already been done", async () => {
            const payment = await request(app)
                .post(`/payment/3465356`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(payment.body).toHaveProperty("status");
            expect(payment.body).toHaveProperty("statusCode");
            expect(payment.body).toHaveProperty("message");
            expect(payment.statusCode).toBe(409);
            expect(payment.body.status).toBe("Failed");
            expect(payment.body.message).toBe(
                "This Transaction Has Already been Finished! Please Make A New One"
            );
        });
        test("It Should Return 401 when The User not login", async () => {
            const payment = await request(app).post(
                `/payment/${bookingId}`
            );

            expect(payment.body).toHaveProperty("status");
            expect(payment.body).toHaveProperty("statusCode");
            expect(payment.body).toHaveProperty("message");
            expect(payment.statusCode).toBe(401);
            expect(payment.body.status).toBe("Failed");
            expect(payment.body.message).toBe("Unauthorized Page!");
        });
		test("It Should Return 404 when booking ticket not found", async () => {
			const payment = await request(app)
				.post(`/payment/1`)
				.set("Authorization", `Bearer ${authToken}`);

			expect(payment.statusCode).toBe(404);
			expect(payment.body.message).toBe("Booking Ticket not found");
		});
    });

	describe("GET /check-payment/:bookingId", () => {
		test("It Should Return 404 when bookingId is missing", async () => {
			const response = await request(app)
				.get(`/check-payment/`)
				.set("Authorization", `Bearer ${authToken}`);
	
			expect(response.statusCode).toBe(400);
			expect(response.body).toHaveProperty("status", "Failed");
			expect(response.body).toHaveProperty("statusCode", 400);
			expect(response.body).toHaveProperty("message", "BookingId is Required");
		});
		test("It Should Return 404 when the booking does not exist or does not belong to the user", async () => {
			const response = await request(app)
				.get(`/check-payment/1`)
				.set("Authorization", `Bearer ${authToken}`);
	
			expect(response.statusCode).toBe(404);
			expect(response.body).toHaveProperty("status", "Failed");
			expect(response.body).toHaveProperty("statusCode", 404);
			expect(response.body).toHaveProperty("message", "Booking not Found");
		});
		test("It Should Return 200 with a success message when payment status is 'Issued'", async () => {
			const login = await request(app).post("/login").send({
                email: "john@mail.com",
                password: "password",
            });
        
            const authTokens = login.body.accessToken;
            
            const issuedBookingId = 50055980;
	
			const response = await request(app)
				.get(`/check-payment/${issuedBookingId}`)
				.set("Authorization", `Bearer ${authTokens}`);
	
			expect(response.statusCode).toBe(200);
			expect(response.body).toHaveProperty("status", "Success");
			expect(response.body).toHaveProperty("statusCode", 200);
			expect(response.body).toHaveProperty("message", "Payment is successful");
			expect(response.body).toHaveProperty("data");
			expect(response.body.data).toHaveProperty("status", "Issued");
		});
		test("It Should Return 200 with a warning message when payment is not finished", async () => {
			const login = await request(app).post("/login").send({
                email: "john@mail.com",
                password: "password",
            });
        
            const authTokens = login.body.accessToken;
            
            const pendingBookingId = 54309057;
	
			const response = await request(app)
				.get(`/check-payment/${pendingBookingId}`)
				.set("Authorization", `Bearer ${authTokens}`);
	
			expect(response.statusCode).toBe(200);
			expect(response.body).toHaveProperty("status", "Success");
			expect(response.body).toHaveProperty("statusCode", 200);
			expect(response.body).toHaveProperty("message", "You haven't Finished the Payment for this Payment!");
			expect(response.body).toHaveProperty("data");
			expect(response.body.data).toHaveProperty("status");
		});
	});
	
});

