-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "UpcomingEarnings" TEXT[] DEFAULT ARRAY[]::TEXT[];
