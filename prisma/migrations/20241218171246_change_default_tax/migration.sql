-- AlterTable
ALTER TABLE "Bookings" ALTER COLUMN "tax" SET DEFAULT 300000;

-- AlterTable
ALTER TABLE "Passengers" ALTER COLUMN "seatId" DROP NOT NULL;
