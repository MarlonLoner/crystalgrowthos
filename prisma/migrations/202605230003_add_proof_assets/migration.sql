-- CreateEnum
CREATE TYPE "ProofAssetType" AS ENUM ('REVIEW_REQUEST', 'TESTIMONIAL', 'BEFORE_AFTER', 'CASE_STUDY', 'REFERRAL_REQUEST', 'SOCIAL_POST', 'OTHER');

-- CreateEnum
CREATE TYPE "ProofStatus" AS ENUM ('TODO', 'REQUESTED', 'RECEIVED', 'DRAFTED', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "ProofAsset" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "quoteId" TEXT,
    "productionJobId" TEXT,
    "type" "ProofAssetType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "url" TEXT,
    "status" "ProofStatus" NOT NULL DEFAULT 'TODO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProofAsset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProofAsset" ADD CONSTRAINT "ProofAsset_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProofAsset" ADD CONSTRAINT "ProofAsset_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProofAsset" ADD CONSTRAINT "ProofAsset_productionJobId_fkey" FOREIGN KEY ("productionJobId") REFERENCES "ProductionJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
