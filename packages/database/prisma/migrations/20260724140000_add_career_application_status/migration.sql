CREATE TABLE IF NOT EXISTS "CareerApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT,
    "portfolio" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CareerApplication_role_idx" ON "CareerApplication"("role");
CREATE INDEX IF NOT EXISTS "CareerApplication_status_idx" ON "CareerApplication"("status");
CREATE INDEX IF NOT EXISTS "CareerApplication_createdAt_idx" ON "CareerApplication"("createdAt");
