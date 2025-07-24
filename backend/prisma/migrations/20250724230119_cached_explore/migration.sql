-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cachedExplore" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
