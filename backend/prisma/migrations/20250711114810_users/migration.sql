/*
  Warnings:

  - You are about to drop the column `Sectors` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `industries` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "Sectors",
DROP COLUMN "industries",
ADD COLUMN     "interestedIndustries" INTEGER[],
ADD COLUMN     "sectors" INTEGER[];
