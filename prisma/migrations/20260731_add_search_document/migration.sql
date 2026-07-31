-- CreateTable
CREATE TABLE "SearchDocument" (
    "id" TEXT NOT NULL,
    "index" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SearchDocument_index_idx" ON "SearchDocument"("index");

