/*
  Warnings:

  - You are about to drop the column `earnings_calls_url` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "earnings_calls_url",
ADD COLUMN     "earnings_calls_urls" TEXT[];
