-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "companiesStocks" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
