/*
  Warnings:

  - Added the required column `seatClassId` to the `Routes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Flights" DROP CONSTRAINT "Flights_seatClassId_fkey";

-- AlterTable
ALTER TABLE "Routes" ADD COLUMN     "seatClassId" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "Routes" ADD CONSTRAINT "Routes_seatClassId_fkey" FOREIGN KEY ("seatClassId") REFERENCES "SeatClasses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
