import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProductionBoardData } from "@/lib/db-data";
import { getProductionSummary } from "@/lib/production-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getProductionBoardData();
  const leadIds = data.jobs.map((item) => item.lead.id);
  const jobIds = data.jobs.map((item) => item.job.id);
  const [recentActivities, proofAssets] = await Promise.all([
    leadIds.length
      ? prisma.followUpActivity.findMany({ where: { leadId: { in: leadIds } }, orderBy: { createdAt: "desc" }, take: 80 })
      : [],
    jobIds.length
      ? prisma.proofAsset.findMany({ where: { productionJobId: { in: jobIds } }, orderBy: { updatedAt: "desc" } })
      : []
  ]);

  return NextResponse.json({
    ok: true,
    source: data.source,
    count: data.jobs.length,
    jobs: data.jobs.map((item) => {
      const jobProofAssets = proofAssets.filter((proof) => proof.productionJobId === item.job.id);
      const reviewProof = jobProofAssets.find((proof) => proof.type === "REVIEW_REQUEST") ?? null;
      const reviewActivity = recentActivities.find((activity) => activity.leadId === item.lead.id && /review requested|request review/i.test(`${activity.title} ${activity.note ?? ""}`));
      const summary = getProductionSummary(item.job, item.quote, item.payments);
      const reviewRequested = item.job.status === "REVIEW_REQUESTED" || ["REQUESTED", "RECEIVED", "DRAFTED", "PUBLISHED"].includes(reviewProof?.status ?? "");
      return {
        job: item.job,
        lead: item.lead,
        quote: item.quote,
        payments: item.payments,
        proofAssetsCount: jobProofAssets.length,
        reviewProofStatus: reviewProof?.status ?? null,
        reviewRequestActivityExists: Boolean(reviewActivity),
        suggestedNextAction: summary.suggestedNextAction,
        availableActions: {
          canComplete: !["COMPLETED", "REVIEW_REQUESTED", "CANCELLED"].includes(item.job.status),
          canRequestReview: !reviewRequested,
          canOpenProof: jobProofAssets.length > 0 || reviewRequested
        },
        summary,
        recentActivities: recentActivities.filter((activity) => activity.leadId === item.lead.id).slice(0, 8)
      };
    })
  });
}
