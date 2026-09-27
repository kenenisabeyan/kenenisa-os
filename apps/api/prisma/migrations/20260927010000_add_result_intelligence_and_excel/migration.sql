-- CreateEnum
CREATE TYPE "ResultSource" AS ENUM ('AUTOMATIC', 'USER_CONFIRMED', 'SYSTEM_VERIFIED', 'UNKNOWN');

-- AlterTable
ALTER TABLE "PlanOutcome" ADD COLUMN IF NOT EXISTS "source" "ResultSource" NOT NULL DEFAULT 'AUTOMATIC';

-- CreateTable
CREATE TABLE IF NOT EXISTS "ResultExportLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "rangeFrom" TEXT,
    "rangeTo" TEXT,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResultExportLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ResultExportLog_userId_createdAt_idx" ON "ResultExportLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ResultExportLog" ADD CONSTRAINT "ResultExportLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
