/*
  Warnings:

  - The `status` column on the `Bookings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[routeId]` on the table `Flights` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[planeId]` on the table `Flights` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[promotionId]` on the table `Flights` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bookingId]` on the table `Payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[departureAirportId]` on the table `Routes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[arrivalAirportId]` on the table `Routes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BookingsStatus" AS ENUM ('PENDING', 'SUCCESS', 'CANCEL');

-- CreateEnum
CREATE TYPE "PaymentsStatus" AS ENUM ('Unpaid', 'Issued', 'Cancelled');

-- AlterTable
ALTER TABLE "Bookings" DROP COLUMN "status",
ADD COLUMN     "status" "BookingsStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Payments" DROP COLUMN "status",
ADD COLUMN     "status" "PaymentsStatus" NOT NULL DEFAULT 'Unpaid';

-- CreateIndex
CREATE UNIQUE INDEX "Flights_routeId_key" ON "Flights"("routeId");

-- CreateIndex
CREATE UNIQUE INDEX "Flights_planeId_key" ON "Flights"("planeId");

-- CreateIndex
CREATE UNIQUE INDEX "Flights_promotionId_key" ON "Flights"("promotionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payments_bookingId_key" ON "Payments"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Routes_departureAirportId_key" ON "Routes"("departureAirportId");

-- CreateIndex
CREATE UNIQUE INDEX "Routes_arrivalAirportId_key" ON "Routes"("arrivalAirportId");
