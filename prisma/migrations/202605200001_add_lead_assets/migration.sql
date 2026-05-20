-- CreateEnum
CREATE TYPE "LeadAssetType" AS ENUM ('SHOPFRONT_IMAGE', 'LOGO', 'REFERENCE_IMAGE', 'OTHER');

-- CreateTable
CREATE TABLE "LeadAsset" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "LeadAssetType" NOT NULL,
    "url" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadAsset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LeadAsset" ADD CONSTRAINT "LeadAsset_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
