/*
  Warnings:

  - A unique constraint covering the columns `[cik_number]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Company_cik_number_key" ON "Company"("cik_number");
