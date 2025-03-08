/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `DoctorHelper` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `time` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Made the column `profileImage` on table `Doctor` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `slug` to the `DoctorHelper` table without a default value. This is not possible if the table is not empty.
  - Made the column `profileImage` on table `DoctorHelper` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "time" TEXT NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "totalAppointments" INTEGER DEFAULT 0,
ALTER COLUMN "profileImage" SET NOT NULL;

-- AlterTable
ALTER TABLE "DoctorHelper" ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "profileImage" SET NOT NULL;

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "days" TEXT[],
    "startTime" TEXT[],
    "endTime" TEXT[],
    "active" BOOLEAN[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_doctorId_key" ON "Schedule"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorHelper_slug_key" ON "DoctorHelper"("slug");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
