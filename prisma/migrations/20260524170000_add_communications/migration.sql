CREATE TYPE "CommunicationChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'SMS', 'INTERNAL_NOTE');
CREATE TYPE "CommunicationDirection" AS ENUM ('OUTBOUND', 'INBOUND');
CREATE TYPE "CommunicationStatus" AS ENUM ('DRAFT', 'READY', 'SENT', 'FAILED', 'SKIPPED', 'SCHEDULED');
CREATE TYPE "CommunicationTrigger" AS ENUM ('NEW_LEAD', 'ASSETS_RECEIVED', 'MISSING_ASSETS', 'MOCKUP_IN_DESIGN', 'MOCKUP_SENT', 'QUOTE_CREATED', 'QUOTE_SENT', 'DEPOSIT_REMINDER', 'PAYMENT_RECEIVED', 'PRODUCTION_STARTED', 'INSTALLATION_SCHEDULED', 'BALANCE_REMINDER', 'JOB_COMPLETED', 'REVIEW_REQUEST', 'REFERRAL_REQUEST', 'CONTENT_PERMISSION', 'CUSTOM');

CREATE TABLE "Communication" (
  "id" TEXT NOT NULL,
  "leadId" TEXT,
  "quoteId" TEXT,
  "productionJobId" TEXT,
  "proofAssetId" TEXT,
  "contentPostId" TEXT,
  "channel" "CommunicationChannel" NOT NULL,
  "direction" "CommunicationDirection" NOT NULL DEFAULT 'OUTBOUND',
  "status" "CommunicationStatus" NOT NULL DEFAULT 'DRAFT',
  "trigger" "CommunicationTrigger" NOT NULL DEFAULT 'CUSTOM',
  "subject" TEXT,
  "body" TEXT NOT NULL,
  "recipientName" TEXT,
  "recipientEmail" TEXT,
  "recipientPhone" TEXT,
  "scheduledFor" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Communication_leadId_idx" ON "Communication"("leadId");
CREATE INDEX "Communication_quoteId_idx" ON "Communication"("quoteId");
CREATE INDEX "Communication_productionJobId_idx" ON "Communication"("productionJobId");
CREATE INDEX "Communication_proofAssetId_idx" ON "Communication"("proofAssetId");
CREATE INDEX "Communication_contentPostId_idx" ON "Communication"("contentPostId");
CREATE INDEX "Communication_status_scheduledFor_idx" ON "Communication"("status", "scheduledFor");
CREATE INDEX "Communication_trigger_channel_idx" ON "Communication"("trigger", "channel");

ALTER TABLE "Communication" ADD CONSTRAINT "Communication_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_productionJobId_fkey" FOREIGN KEY ("productionJobId") REFERENCES "ProductionJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_proofAssetId_fkey" FOREIGN KEY ("proofAssetId") REFERENCES "ProofAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_contentPostId_fkey" FOREIGN KEY ("contentPostId") REFERENCES "ContentPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
