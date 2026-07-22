-- AlterTable: multi-item checkout support
ALTER TABLE "UpiPayment" ADD COLUMN "items" JSONB;
