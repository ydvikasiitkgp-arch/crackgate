-- CreateTable
CREATE TABLE "NewsletterSend" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSendItem" (
    "id" TEXT NOT NULL,
    "sendId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,

    CONSTRAINT "NewsletterSendItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsletterSend_sentAt_idx" ON "NewsletterSend"("sentAt" DESC);

-- CreateIndex
CREATE INDEX "NewsletterSendItem_sendId_idx" ON "NewsletterSendItem"("sendId");

-- AddForeignKey
ALTER TABLE "NewsletterSendItem" ADD CONSTRAINT "NewsletterSendItem_sendId_fkey" FOREIGN KEY ("sendId") REFERENCES "NewsletterSend"("id") ON DELETE CASCADE ON UPDATE CASCADE;
