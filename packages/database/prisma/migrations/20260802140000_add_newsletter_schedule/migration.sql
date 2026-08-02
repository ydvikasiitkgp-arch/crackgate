-- CreateTable
CREATE TABLE "NewsletterSchedule" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "recipients" JSONB NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "jobId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsletterSchedule_status_idx" ON "NewsletterSchedule"("status");

-- CreateIndex
CREATE INDEX "NewsletterSchedule_scheduledAt_idx" ON "NewsletterSchedule"("scheduledAt");
