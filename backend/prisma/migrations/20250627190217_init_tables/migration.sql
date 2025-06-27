/*
  Warnings:

  - You are about to drop the column `earnings_calls_urls` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `fivek_urls` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `tenk_url` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "earnings_calls_urls",
DROP COLUMN "fivek_urls",
DROP COLUMN "tenk_url";

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filed_date" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
