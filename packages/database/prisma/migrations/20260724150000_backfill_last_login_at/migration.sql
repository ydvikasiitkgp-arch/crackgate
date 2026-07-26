-- Backfill: set lastLoginAt = createdAt for users who never re-logged-in
UPDATE "User" SET "lastLoginAt" = "createdAt" WHERE "lastLoginAt" IS NULL;
