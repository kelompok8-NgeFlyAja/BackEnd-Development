/*
  Warnings:

  - You are about to drop the column `dateFlight` on the `Flights` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Routes` table. All the data in the column will be lost.
  - Added the required column `duration` to the `Flights` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Flights" DROP COLUMN "dateFlight",
ADD COLUMN     "duration" TEXT NOT NULL,
ALTER COLUMN "arrivalTime" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "Routes" DROP COLUMN "duration";
