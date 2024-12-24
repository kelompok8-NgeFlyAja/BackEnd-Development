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
const booking3 = {
	bookingTicket: {
		flightId: 22,
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
const booking2 = {
	bookingTicket: {
		flightId: 2312837,
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
const bookingPassengerDetail = {
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
			identityExpired: "2025-06-15",
			seatName: "2E",
		},
		{
			title: "Mr.",
			fullName: "Charlie Test",
			familyName: "Test",
			birthDate: "2002-07-15",
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
			seatName: "4E",
		},
	],
	adultPassenger: 2,
	childPassenger: 1,
	babyPassenger: 1,
};
const bookingPassengerFailed = {
	bookingTicket: {
		flightId: 25,
		bookerName: "John Test",
		bookerEmail: "test@gmail.com",
		bookerPhone: "081212123434",
	},
	passengerDetail: [
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
const bookingFailed = {
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

	const login = await request(app).post("/login").send({
		email: "test@gmail.com",
		password: "password",
	});

	authToken = login.body.accessToken;
});

afterAll(async () => {
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
			email: "test@gmail.com",
		},
	});

	await prisma.$disconnect();
});

describe("Testing for Booking Route", () => {
	describe("GET /ticket-details", () => {
		test("It Should return 200 when All Field is Filled", async () => {
			const flightId = 1;
			const ap = 2;
			const cp = 1;
			const bp = 1;
			const ticketDetail = await request(app).get(
				`/ticket-details?flightId=${flightId}&adultPassenger=${ap}&childPassenger=${cp}&babyPassenger=${bp}`
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
				`/ticket-details?adultPassenger=${ap}&childPassenger=${cp}&babyPassenger=${bp}`
			);

			expect(ticketDetail.body).toHaveProperty("status");
			expect(ticketDetail.body).toHaveProperty("statusCode");
			expect(ticketDetail.body).toHaveProperty("message");
			expect(ticketDetail.statusCode).toBe(400);
			expect(ticketDetail.body.status).toBe("Failed");
			expect(ticketDetail.body.message).toBe("Flight ID is required");
		});
		test("It Should return 400 when No Passengers Are Provided", async () => {
			const flightId = 1;
			const ticketDetail = await request(app).get(
				`/ticket-details?flightId=${flightId}`
			);

			expect(ticketDetail.body).toHaveProperty("status");
			expect(ticketDetail.body).toHaveProperty("statusCode");
			expect(ticketDetail.statusCode).toBe(400);
			expect(ticketDetail.body.status).toBe("Failed");
			expect(ticketDetail.body.message).toBe(
				"Please Fill The Amount of Passenger!"
			);
		});
		test("It Should return 400 when No Adult Passenger Is Provided", async () => {
			const flightId = 1;
			const cp = 1;
			const bp = 1;
			const ticketDetail = await request(app).get(
				`/ticket-details?flightId=${flightId}&childPassenger=${cp}&babyPassenger=${bp}`
			);

			expect(ticketDetail.body).toHaveProperty("status");
			expect(ticketDetail.body).toHaveProperty("statusCode");
			expect(ticketDetail.statusCode).toBe(400);
			expect(ticketDetail.body.status).toBe("Failed");
			expect(ticketDetail.body.message).toBe(
				"There Should Be A minimum of One Adult Passenger!"
			);
		});
		test("It Should return 404 when no Flight Id Found", async () => {
			const flightId = 11111;
			const ap = 2;
			const cp = 1;
			const bp = 1;
			const ticketDetail = await request(app).get(
				`/ticket-details?flightId=${flightId}&adultPassenger=${ap}&childPassenger=${cp}&babyPassenger=${bp}`
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
		test("It should return 201 when All Requirement are filled", async () => {
			const ticketBooking = await request(app)
				.post("/ticket-booking")
				.send(booking)
				.set("Authorization", `Bearer ${authToken}`);

			bookingId = ticketBooking.body.bookingId;

			expect(ticketBooking.body).toHaveProperty("status");
			expect(ticketBooking.body).toHaveProperty("statusCode");
			expect(ticketBooking.body).toHaveProperty("bookingId");
			expect(ticketBooking.body).toHaveProperty("bookingCode");
			expect(ticketBooking.body).toHaveProperty("message");
			expect(ticketBooking.statusCode).toBe(201);
			expect(ticketBooking.body.status).toBe("Success");
			expect(ticketBooking.body.message).toBe(
				"Booking Successfully Created"
			);
		});
		test("It Should return 401 when user hasnt Login", async () => {
			const ticketBooking = await request(app)
				.post("/ticket-booking")
				.send(booking);

			expect(ticketBooking.body).toHaveProperty("status");
			expect(ticketBooking.body).toHaveProperty("statusCode");
			expect(ticketBooking.body).toHaveProperty("message");
			expect(ticketBooking.statusCode).toBe(401);
			expect(ticketBooking.body.status).toBe("Failed");
			expect(ticketBooking.body.message).toBe("Unauthorized Page!");
		});
		test("It Should return 400 when any of the Requirement are not Filled", async () => {
			const ticketBooking = await request(app)
				.post("/ticket-booking")
				.send(bookingFailed)
				.set("Authorization", `Bearer ${authToken}`);

			expect(ticketBooking.body).toHaveProperty("status");
			expect(ticketBooking.body).toHaveProperty("statusCode");
			expect(ticketBooking.body).toHaveProperty("message");
			expect(ticketBooking.statusCode).toBe(400);
			expect(ticketBooking.body.status).toBe("Failed");
			expect(ticketBooking.body.message).toBe(
				"Make Sure To Fill All The Booker Forms!"
			);
		});
		test("It Should return 400 when The Passenger Form Are Not Equal to the Total of Passenger", async () => {
			const ticketBooking = await request(app)
				.post("/ticket-booking")
				.send(bookingPassengerFailed)
				.set("Authorization", `Bearer ${authToken}`);

			expect(ticketBooking.body).toHaveProperty("status");
			expect(ticketBooking.body).toHaveProperty("statusCode");
			expect(ticketBooking.body).toHaveProperty("message");
			expect(ticketBooking.statusCode).toBe(400);
			expect(ticketBooking.body.status).toBe("Failed");
			expect(ticketBooking.body.message).toBe(
				"The total of passenger details does not match the number of passengers provided!"
			);
		});
		test("It Should return 400 when some of The Passenger Detail are not Filled", async () => {
			const ticketBooking = await request(app)
				.post("/ticket-booking")
				.send(bookingPassengerDetail)
				.set("Authorization", `Bearer ${authToken}`);

			expect(ticketBooking.body).toHaveProperty("status");
			expect(ticketBooking.body).toHaveProperty("statusCode");
			expect(ticketBooking.body).toHaveProperty("message");
			expect(ticketBooking.statusCode).toBe(400);
			expect(ticketBooking.body.status).toBe("Failed");
			expect(ticketBooking.body.message).toBe(
				"Make Sure To Fill All The Passenger Forms!"
			);
		});
		test("It Should return 400 when The Seats Are Already Taken", async () => {
			const selectedSeatName = "1E";
			const selectedSeat = await prisma.seats.findFirst({
				where: {
					seatNumber: selectedSeatName,
					planeId: 25,
				},
			});

			await prisma.seats.update({
				where: { id: selectedSeat.id },
				data: { isAvailable: false },
			});

			const ticketBooking = await request(app)
				.post("/ticket-booking")
				.send(booking)
				.set("Authorization", `Bearer ${authToken}`);

			expect(ticketBooking.body).toHaveProperty("status");
			expect(ticketBooking.body).toHaveProperty("statusCode");
			expect(ticketBooking.body).toHaveProperty("message");
			expect(ticketBooking.statusCode).toBe(400);
			expect(ticketBooking.body.status).toBe("Failed");
			expect(ticketBooking.body.message).toBe(
				`Seat ${selectedSeatName} is already taken`
			);
		});
		test("It Should return 400 when Passenger Counts are not Numbers", async () => {
			const invalidBooking = {
				...booking,
				adultPassenger: "two",
				childPassenger: "one",
				babyPassenger: "zero",
			};
			const ticketBooking = await request(app)
				.post("/ticket-booking")
				.send(invalidBooking)
				.set("Authorization", `Bearer ${authToken}`);

			expect(ticketBooking.body).toHaveProperty("status");
			expect(ticketBooking.body).toHaveProperty("statusCode");
			expect(ticketBooking.body).toHaveProperty("message");
			expect(ticketBooking.statusCode).toBe(400);
			expect(ticketBooking.body.status).toBe("Failed");
			expect(ticketBooking.body.message).toBe(
				"Passenger counts must be Number!"
			);
		});
		test("It Should return 404 when Plane Not Found", async () => {
			const ticketBooking = await request(app)
				.post("/ticket-booking")
				.send(booking2)
				.set("Authorization", `Bearer ${authToken}`);

			expect(ticketBooking.body).toHaveProperty("status");
			expect(ticketBooking.body).toHaveProperty("statusCode");
			expect(ticketBooking.body).toHaveProperty("message");
			expect(ticketBooking.statusCode).toBe(404);
			expect(ticketBooking.body.status).toBe("Failed");
			expect(ticketBooking.body.message).toBe("Plane Not Found");
		});
		test("It Should return 400 when bookerName is missing", async () => {
			const bookingWithoutBookerName = {
				flightId: 1,
				bookerEmail: "john@example.com",
				bookerPhone: "1234567890",
			};
			const passengerDetail = [
				{
					title: "Mr.",
					fullName: "Jane Doe",
					birthDate: "01-01-1990",
					nationality: "USA",
					identityNumber: "123456789",
					identityCountry: "USA",
					identityExpired: "01-01-2030",
					seatName: "12A",
				},
			];

			const ticketBooking = await request(app)
				.post("/ticket-booking")
				.send({
					bookingTicket: bookingWithoutBookerName,
					passengerDetail: passengerDetail,
				})
				.set("Authorization", `Bearer ${authToken}`);

			expect(ticketBooking.body).toHaveProperty("status");
			expect(ticketBooking.body).toHaveProperty("statusCode");
			expect(ticketBooking.body).toHaveProperty("message");
			expect(ticketBooking.statusCode).toBe(400);
			expect(ticketBooking.body.status).toBe("Failed");
			expect(ticketBooking.body.message).toBe(
				"Make Sure To Fill All The Booker Forms!"
			);
		});
	});

	describe("GET /booking/:bookingId", () => {
		test("It Should return 200 when all requirement are filled", async () => {
			const login = await request(app).post("/login").send({
				email: "john@mail.com",
				password: "password",
			});
			// 3465356
			const authTokens = login.body.accessToken;

			const booking = await request(app)
				.get(`/booking/3465356`)
				.set("Authorization", `Bearer ${authTokens}`);

			expect(booking.body).toHaveProperty("status");
			expect(booking.body).toHaveProperty("statusCode");
			expect(booking.body).toHaveProperty("message");
			expect(booking.body).toHaveProperty("data");
			expect(booking.statusCode).toBe(200);
			expect(booking.body.status).toBe("Success");
			expect(booking.body.message).toBe(
				"Booking details retrieved successfully"
			);
		});
		test("It Should return 400 when BookingId is not a number", async () => {
			const login = await request(app).post("/login").send({
				email: "john@mail.com",
				password: "password",
			});
			// 3465356
			const authTokens = login.body.accessToken;

			const booking = await request(app)
				.get(`/booking/one`)
				.set("Authorization", `Bearer ${authTokens}`);

			expect(booking.body).toHaveProperty("status");
			expect(booking.body).toHaveProperty("statusCode");
			expect(booking.body).toHaveProperty("message");
			expect(booking.statusCode).toBe(400);
			expect(booking.body.status).toBe("Failed");
			expect(booking.body.message).toBe(
				"Booking ID must be a valid number"
			);
		});
		test("It Should return 404 when BookingId Not Found", async () => {
			const login = await request(app).post("/login").send({
				email: "john@mail.com",
				password: "password",
			});
			// 3465356
			const authTokens = login.body.accessToken;

			const booking = await request(app)
				.get(`/booking/1`)
				.set("Authorization", `Bearer ${authTokens}`);

			expect(booking.body).toHaveProperty("status");
			expect(booking.body).toHaveProperty("statusCode");
			expect(booking.body).toHaveProperty("message");
			expect(booking.statusCode).toBe(404);
			expect(booking.body.status).toBe("Failed");
			expect(booking.body.message).toBe(
				"Booking not found"
			);
		});
	});
});
