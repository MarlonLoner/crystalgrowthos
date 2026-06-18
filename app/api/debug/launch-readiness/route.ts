import { CommunicationTrigger } from "@prisma/client";
import { NextResponse } from "next/server";
import { authProtectionConfigured } from "@/lib/auth";
import { getEmailProviderStatus } from "@/lib/email-provider";
import { prisma } from "@/lib/prisma";
import { classifyLaunchRoute, protectedLaunchRoutes, publicLaunchRoutes } from "@/lib/route-classification";

export const dynamic = "force-dynamic";

export async function GET() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [standardLeads, shopfrontLeads, repeatActivities, missingContactLeads, communications, latestLeads] = await Promise.all([
    prisma.lead.count({ where: { source: { contains: "Website intake", mode: "insensitive" }, createdAt: { gte: since } } }),
    prisma.lead.count({ where: { source: { contains: "Shopfront mockup", mode: "insensitive" }, createdAt: { gte: since } } }),
    prisma.followUpActivity.count({ where: { createdAt: { gte: since }, OR: [{ title: { contains: "Repeat intake", mode: "insensitive" } }, { title: { contains: "Repeat shopfront", mode: "insensitive" } }] } }),
    prisma.lead.count({ where: { OR: [{ email: "" }, { phone: "" }] } }),
    prisma.communication.findMany({
      where: {
        createdAt: { gte: since },
        trigger: { in: [CommunicationTrigger.NEW_LEAD, CommunicationTrigger.ASSETS_RECEIVED, CommunicationTrigger.MISSING_ASSETS] }
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, leadId: true, channel: true, status: true, trigger: true, createdAt: true }
    }),
    prisma.lead.findMany({
      where: { OR: [{ source: { contains: "Website intake", mode: "insensitive" } }, { source: { contains: "Shopfront mockup", mode: "insensitive" } }] },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, businessName: true, source: true, createdAt: true, email: true, phone: true }
    })
  ]);

  const emailStatus = getEmailProviderStatus();
  const checks = {
    authEnabled: authProtectionConfigured(),
    databaseReachable: true,
    blobTokenConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    resendConfigured: emailStatus.resendConfigured,
    emailTestMode: emailStatus.testMode,
    autoEmailEnabled: String(process.env.AUTO_EMAIL_ENABLED ?? "").toLowerCase() === "true",
    debugRoutesProtected: classifyLaunchRoute("/api/debug") === "protected",
    publicRoutes: publicLaunchRoutes.map((route) => ({ route, classification: route === "/q/[quoteNumber]" ? "public pattern" : classifyLaunchRoute(route) })),
    protectedRoutes: protectedLaunchRoutes.map((route) => ({ route, classification: route === "/api/debug/*" ? "protected pattern" : classifyLaunchRoute(route) }))
  };

  return NextResponse.json({
    ok: true,
    window: "last 24 hours",
    submissions: {
      total: standardLeads + shopfrontLeads,
      successfulStandardSubmissions: standardLeads,
      successfulShopfrontSubmissions: shopfrontLeads,
      duplicateOrRepeatSubmissionCount: repeatActivities,
      latestSubmissionTimestamps: latestLeads.map((lead) => ({ id: lead.id, businessName: lead.businessName, source: lead.source, createdAt: lead.createdAt }))
    },
    uploads: {
      failedUploadCount: "not persisted",
      acceptedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"],
      maxFileSizeMb: 8
    },
    dataQuality: {
      leadsMissingContactDetails: missingContactLeads,
      communicationsCreatedFromNewSubmissions: communications.length,
      latestSubmissionCommunications: communications
    },
    routeChecks: checks,
    communicationSafety: {
      draftAndReadyAutoSendBlocked: true,
      scheduledEmailRequiresAutoEmailEnabled: true,
      launchTemplateApprovalModel: "static warning only",
      liveSendingWarning: !emailStatus.testMode && String(process.env.AUTO_EMAIL_ENABLED ?? "").toLowerCase() === "true"
    }
  });
}
