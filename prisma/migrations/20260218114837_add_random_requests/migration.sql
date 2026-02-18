-- CreateEnum
CREATE TYPE "RandomType" AS ENUM ('FLOAT', 'INTEGER');

-- CreateTable
CREATE TABLE "RandomRequest" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "type" "RandomType" NOT NULL DEFAULT 'FLOAT',
    "min" DOUBLE PRECISION NOT NULL,
    "max" DOUBLE PRECISION NOT NULL,
    "result" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RandomRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RandomRequest_apiKeyId_createdAt_idx" ON "RandomRequest"("apiKeyId", "createdAt");

-- AddForeignKey
ALTER TABLE "RandomRequest" ADD CONSTRAINT "RandomRequest_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
