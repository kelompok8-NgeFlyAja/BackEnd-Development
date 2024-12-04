-- CreateTable
CREATE TABLE "Airports" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "continent" TEXT NOT NULL,
    "airportCode" TEXT NOT NULL,

    CONSTRAINT "Airports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routes" (
    "id" SERIAL NOT NULL,
    "departureAirportId" INTEGER NOT NULL,
    "arrivalAirportId" INTEGER NOT NULL,
    "seatClassId" INTEGER NOT NULL,

    CONSTRAINT "Routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flights" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "planeId" INTEGER NOT NULL,
    "promotionId" INTEGER,
    "duration" TEXT NOT NULL,
    "departureTime" TIMESTAMPTZ(3) NOT NULL,
    "arrivalTime" TIMESTAMPTZ(3) NOT NULL,
    "flightCode" TEXT NOT NULL,

    CONSTRAINT "Flights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Planes" (
    "id" SERIAL NOT NULL,
    "planeName" TEXT NOT NULL,
    "totalSeat" INTEGER NOT NULL,
    "planeCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "airline" TEXT NOT NULL,
    "baggage" INTEGER NOT NULL,
    "cabinBaggage" INTEGER NOT NULL,

    CONSTRAINT "Planes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seats" (
    "id" SERIAL NOT NULL,
    "planeId" INTEGER NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL,

    CONSTRAINT "Seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActivated" BOOLEAN NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "flightId" INTEGER NOT NULL,
    "bookingCode" TEXT NOT NULL,
    "bookingDate" TIMESTAMPTZ(3) NOT NULL,
    "adultPassenger" INTEGER NOT NULL DEFAULT 0,
    "childPassenger" INTEGER NOT NULL DEFAULT 0,
    "babyPassenger" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "bookerName" TEXT NOT NULL,
    "bookerEmail" TEXT NOT NULL,
    "bookerPhone" TEXT NOT NULL,
    "totalPrice" INTEGER NOT NULL,

    CONSTRAINT "Bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passengers" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "birthDate" TIMESTAMPTZ(3) NOT NULL,
    "nationality" TEXT NOT NULL,
    "identityNumber" TEXT NOT NULL,
    "identityCountry" TEXT NOT NULL,
    "identityExpired" TIMESTAMPTZ(3) NOT NULL,
    "seatId" INTEGER NOT NULL,

    CONSTRAINT "Passengers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "expiredDate" TIMESTAMPTZ(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotions" (
    "id" SERIAL NOT NULL,
    "promotionName" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "startDate" TIMESTAMPTZ(3) NOT NULL,
    "endDate" TIMESTAMPTZ(3) NOT NULL,
    "discount" INTEGER NOT NULL,

    CONSTRAINT "Promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatClasses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "priceAdult" INTEGER NOT NULL,
    "priceChild" INTEGER NOT NULL,
    "priceBaby" INTEGER NOT NULL,

    CONSTRAINT "SeatClasses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Airports_airportCode_key" ON "Airports"("airportCode");

-- CreateIndex
CREATE UNIQUE INDEX "Routes_seatClassId_key" ON "Routes"("seatClassId");

-- CreateIndex
CREATE UNIQUE INDEX "Flights_routeId_key" ON "Flights"("routeId");

-- CreateIndex
CREATE UNIQUE INDEX "Flights_planeId_key" ON "Flights"("planeId");

-- CreateIndex
CREATE UNIQUE INDEX "Flights_promotionId_key" ON "Flights"("promotionId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Passengers_seatId_key" ON "Passengers"("seatId");

-- CreateIndex
CREATE UNIQUE INDEX "Payments_bookingId_key" ON "Payments"("bookingId");

-- AddForeignKey
ALTER TABLE "Routes" ADD CONSTRAINT "Routes_arrivalAirportId_fkey" FOREIGN KEY ("arrivalAirportId") REFERENCES "Airports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routes" ADD CONSTRAINT "Routes_departureAirportId_fkey" FOREIGN KEY ("departureAirportId") REFERENCES "Airports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routes" ADD CONSTRAINT "Routes_seatClassId_fkey" FOREIGN KEY ("seatClassId") REFERENCES "SeatClasses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flights" ADD CONSTRAINT "Flights_planeId_fkey" FOREIGN KEY ("planeId") REFERENCES "Planes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flights" ADD CONSTRAINT "Flights_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flights" ADD CONSTRAINT "Flights_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seats" ADD CONSTRAINT "Seats_planeId_fkey" FOREIGN KEY ("planeId") REFERENCES "Planes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passengers" ADD CONSTRAINT "Passengers_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passengers" ADD CONSTRAINT "Passengers_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
