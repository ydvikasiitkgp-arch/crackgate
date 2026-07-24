-- AlterTable
ALTER TABLE "CareerApplication" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'new';
ALTER TABLE "CareerApplication" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "CareerApplication" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CareerApplication_status_idx" ON "CareerApplication"("status");
