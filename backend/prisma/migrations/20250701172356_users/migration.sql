-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "link" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "publishDate" TIMESTAMP(3) NOT NULL,
    "language" TEXT NOT NULL,
    "images" TEXT[],
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
