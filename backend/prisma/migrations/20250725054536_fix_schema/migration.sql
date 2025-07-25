/*
  Warnings:

  - You are about to drop the `SavedModel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SavedModel" DROP CONSTRAINT "SavedModel_portfolioId_fkey";

-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "model" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "SavedModel";
