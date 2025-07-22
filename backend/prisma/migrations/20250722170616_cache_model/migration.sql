-- CreateTable
CREATE TABLE "SavedModel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "topology" JSONB NOT NULL,
    "weights" BYTEA NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedModel_portfolioId_key" ON "SavedModel"("portfolioId");

-- AddForeignKey
ALTER TABLE "SavedModel" ADD CONSTRAINT "SavedModel_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
