-- CreateEnum
CREATE TYPE "ContentPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'WHATSAPP_STATUS', 'LINKEDIN', 'TIKTOK', 'WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "ContentFormat" AS ENUM ('BEFORE_AFTER', 'TESTIMONIAL', 'CASE_STUDY', 'COMPLETED_PROJECT', 'OFFER', 'EDUCATIONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('IDEA', 'DRAFTED', 'READY', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "ContentPost" (
    "id" TEXT NOT NULL,
    "proofAssetId" TEXT,
    "leadId" TEXT,
    "quoteId" TEXT,
    "productionJobId" TEXT,
    "title" TEXT NOT NULL,
    "platform" "ContentPlatform" NOT NULL DEFAULT 'FACEBOOK',
    "format" "ContentFormat" NOT NULL DEFAULT 'COMPLETED_PROJECT',
    "status" "ContentStatus" NOT NULL DEFAULT 'IDEA',
    "caption" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContentPost" ADD CONSTRAINT "ContentPost_proofAssetId_fkey" FOREIGN KEY ("proofAssetId") REFERENCES "ProofAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPost" ADD CONSTRAINT "ContentPost_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPost" ADD CONSTRAINT "ContentPost_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPost" ADD CONSTRAINT "ContentPost_productionJobId_fkey" FOREIGN KEY ("productionJobId") REFERENCES "ProductionJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
