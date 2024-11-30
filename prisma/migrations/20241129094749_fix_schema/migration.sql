/*
  Warnings:

  - A unique constraint covering the columns `[seatId]` on the table `Passengers` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `status` on the `Bookings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `seatId` to the `Passengers` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Bookings" ADD COLUMN     "adultPassenger" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "babyPassenger" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "childPassenger" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Passengers" ADD COLUMN     "seatId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Payments" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- DropEnum
DROP TYPE "BookingsStatus";

-- DropEnum
DROP TYPE "PaymentsStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Passengers_seatId_key" ON "Passengers"("seatId");

-- AddForeignKey
ALTER TABLE "Passengers" ADD CONSTRAINT "Passengers_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
