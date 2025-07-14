-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "permittedUsers" INTEGER[];
