/*
  Warnings:

  - You are about to drop the column `earnings_calls` on the `Company` table. All the data in the column will be lost.
  - The `fivek_urls` column on the `Company` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `cik_number` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "earnings_calls",
ADD COLUMN     "cik_number" INTEGER NOT NULL,
ADD COLUMN     "earnings_calls_url" TEXT[],
DROP COLUMN "fivek_urls",
ADD COLUMN     "fivek_urls" TEXT[];
