const request = require("supertest");
const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const password = process.env.PASSWORD_SALT
const salt = parseInt(process.env.SALT)

const hashedPassword = bcrypt.hashSync(password, salt);

let authToken;

const booking = {
	bookingTicket: {
		flightId: 1,
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
});

afterAll(async () => {
    const bookingId = global.bookingId;

    const passengers = await prisma.passengers.findMany({
        where: {
            bookingId: bookingId
        },
        select: {
            seatId: true
        }
    });

    for (const passenger of passengers) {
        if (passenger.seatId) {
            await prisma.seats.update({
                where: { id: passenger.seatId },
                data: { isAvailable: true }
            });
        }
    }

    await prisma.passengers.deleteMany({
        where: {
            bookingId: bookingId
        }
    });

    await prisma.bookings.delete({
        where: {
            id: bookingId
        }
    });

	await prisma.users.deleteMany({
		where: {
			email: "test@mail.com",
		},
	});
});

describe("Testing for Booking Route", () => {
	describe("GET /ticket-details", () => {
		test("It Should return 200 when All Field is Filled", async () => {
			const flightId = 1;
			const ap = 2;
			const cp = 1;
			const bp = 1;
			const ticketDetail = await request(app).get(
				`/ticket-details?flightId=${flightId}&ap=${ap}&cp=${cp}&bp=${bp}`
			);

			expect(ticketDetail.body).toHaveProperty("status");
			expect(ticketDetail.body).toHaveProperty("statusCode");
			expect(ticketDetail.statusCode).toBe(200);
			expect(ticketDetail.body.status).toBe("Success");
			expect(ticketDetail.body).toHaveProperty("message");
		});
		test("It Should return 400 when no Flight Id not Filled", async () => {
			const ap = 2;
			const cp = 1;
			const bp = 1;
			const ticketDetail = await request(app).get(
				`/ticket-details?flightId=&ap=${ap}&cp=${cp}&bp=${bp}`
			);

			expect(ticketDetail.body).toHaveProperty("status");
			expect(ticketDetail.body).toHaveProperty("statusCode");
			expect(ticketDetail.body).toHaveProperty("message");
			expect(ticketDetail.statusCode).toBe(400);
			expect(ticketDetail.body.status).toBe("Failed");
			expect(ticketDetail.body.message).toBe("Flight ID is required");
		});
		test("It Should return 404 when no Flight Id Found", async () => {
			const flightId = 11111;
			const ap = 2;
			const cp = 1;
			const bp = 1;
			const ticketDetail = await request(app).get(
				`/ticket-details?flightId=${flightId}&ap=${ap}&cp=${cp}&bp=${bp}`
			);

			expect(ticketDetail.body).toHaveProperty("status");
			expect(ticketDetail.body).toHaveProperty("statusCode");
			expect(ticketDetail.body).toHaveProperty("message");
			expect(ticketDetail.statusCode).toBe(404);
			expect(ticketDetail.body.status).toBe("Failed");
			expect(ticketDetail.body.message).toBe("Flight not found");
		});
	});

	describe("POST /ticket-booking", () => {
		test("It should return 200 when All Requirement are filled", async () => {
			const login = await request(app).post("/login").send({
				email: "test@gmail.com",
				password: "password",
			});

            console.log(login, '-> Login');
            

			authToken = login.body.accessToken;
            console.log(authToken, '-> the token');
            

			const ticketBooking = await request(app)
				.post("/ticket-booking")
				.send(booking)
				.set("Authorization", `Bearer ${authToken}`);
            
            global.bookingId = ticketBooking.body.bookingId;

			expect(ticketBooking.body).toHaveProperty("status");
			expect(ticketBooking.body).toHaveProperty("statusCode");
			expect(ticketBooking.body).toHaveProperty("bookingId");
			expect(ticketBooking.body).toHaveProperty("bookingCode");
			expect(ticketBooking.body).toHaveProperty("message");
			expect(ticketBooking.statusCode).toBe(200);
			expect(ticketBooking.body.status).toBe("Success");
			expect(ticketBooking.body.message).toBe("Booking Successfully Created");
		});
	});
});
