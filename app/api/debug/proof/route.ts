import { NextResponse } from "next/server";
import { getProofBoardData } from "@/lib/db-data";
import { getProofSummary } from "@/lib/proof-intelligence";
import { generateProofContentDrafts } from "@/lib/proof-content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function groupCount(values: string[]) {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

export async function GET() {
  const data = await getProofBoardData();
  const completedJobs = await prisma.productionJob.findMany({
    where: { status: { in: ["COMPLETED", "REVIEW_REQUESTED"] } },
    include: { proofAssets: true, lead: true, quote: true },
    orderBy: { updatedAt: "desc" }
  });
  const jobsMissingProofAssets = completedJobs
    .filter((job) => job.proofAssets.length === 0)
    .map((job) => ({
      id: job.id,
      status: job.status,
      title: job.title,
      leadId: job.leadId,
      quoteId: job.quoteId,
      businessName: job.lead.businessName,
      quoteNumber: job.quote.quoteNumber
    }));
  const leadIds = Array.from(new Set([...data.items.map((item) => item.lead.id), ...completedJobs.map((job) => job.leadId)]));
  const recentActivities = leadIds.length
    ? await prisma.followUpActivity.findMany({ where: { leadId: { in: leadIds } }, orderBy: { createdAt: "desc" }, take: 80 })
    : [];

  const items = data.items.map((item) => {
    const relatedActivities = recentActivities.filter((activity) => {
      const text = `${activity.title} ${activity.note ?? ""}`.toLowerCase();
      return activity.leadId === item.lead.id && /review|testimonial|before\/after|before after|referral|proof|social|content/.test(text);
    });

    return {
      ...item,
      hasRelatedActivities: relatedActivities.length > 0,
      relatedActivities: relatedActivities.slice(0, 6),
      summary: getProofSummary({ lead: item.lead, quote: item.quote, job: item.productionJob, proofAssets: [item.proof] }),
      contentDrafts: generateProofContentDrafts({ lead: item.lead, quote: item.quote, job: item.productionJob })
    };
  });

  return NextResponse.json({
    ok: true,
    source: data.source,
    totalCompletedOrReviewRequestedJobs: completedJobs.length,
    totalProofAssets: data.items.length,
    jobsMissingProofAssets,
    jobsMissingProofAssetsCount: jobsMissingProofAssets.length,
    syncRoute: "/api/debug/proof/sync",
    groupedByStatus: groupCount(data.items.map((item) => item.proof.status)),
    groupedByType: groupCount(data.items.map((item) => item.proof.type)),
    latestProofAssets: items.slice(0, 20),
    items
  });
}
