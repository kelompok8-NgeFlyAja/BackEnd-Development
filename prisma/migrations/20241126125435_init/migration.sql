-- DropForeignKey
ALTER TABLE "Bookings" DROP CONSTRAINT "Bookings_flightId_fkey";

-- DropForeignKey
ALTER TABLE "Bookings" DROP CONSTRAINT "Bookings_userId_fkey";

-- DropForeignKey
ALTER TABLE "Flights" DROP CONSTRAINT "Flights_planeId_fkey";

-- DropForeignKey
ALTER TABLE "Flights" DROP CONSTRAINT "Flights_routeId_fkey";

-- DropForeignKey
ALTER TABLE "Flights" DROP CONSTRAINT "Flights_seatClassId_fkey";

-- DropForeignKey
ALTER TABLE "Passengers" DROP CONSTRAINT "Passengers_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Payments" DROP CONSTRAINT "Payments_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Routes" DROP CONSTRAINT "Routes_arrivalAirportId_fkey";

-- DropForeignKey
ALTER TABLE "Routes" DROP CONSTRAINT "Routes_departureAirportId_fkey";

-- DropForeignKey
ALTER TABLE "Seats" DROP CONSTRAINT "Seats_planeId_fkey";

-- AddForeignKey
ALTER TABLE "Routes" ADD CONSTRAINT "Routes_departureAirportId_fkey" FOREIGN KEY ("departureAirportId") REFERENCES "Airports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routes" ADD CONSTRAINT "Routes_arrivalAirportId_fkey" FOREIGN KEY ("arrivalAirportId") REFERENCES "Airports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flights" ADD CONSTRAINT "Flights_seatClassId_fkey" FOREIGN KEY ("seatClassId") REFERENCES "SeatClasses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flights" ADD CONSTRAINT "Flights_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flights" ADD CONSTRAINT "Flights_planeId_fkey" FOREIGN KEY ("planeId") REFERENCES "Planes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seats" ADD CONSTRAINT "Seats_planeId_fkey" FOREIGN KEY ("planeId") REFERENCES "Planes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passengers" ADD CONSTRAINT "Passengers_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
