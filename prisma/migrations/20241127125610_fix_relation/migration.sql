/*
  Warnings:

  - A unique constraint covering the columns `[seatClassId]` on the table `Routes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Flights" ALTER COLUMN "departureTime" SET DATA TYPE TIMESTAMPTZ(3);

-- CreateIndex
CREATE UNIQUE INDEX "Routes_seatClassId_key" ON "Routes"("seatClassId");
