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
  const leadIds = data.items.map((item) => item.lead.id);
  const recentActivities = leadIds.length
    ? await prisma.followUpActivity.findMany({ where: { leadId: { in: leadIds } }, orderBy: { createdAt: "desc" }, take: 80 })
    : [];

  const items = data.items.map((item) => {
    const relatedActivities = recentActivities.filter((activity) => {
      const text = `${activity.title} ${activity.note ?? ""}`.toLowerCase();
      return activity.leadId === item.lead.id && /review|testimonial|before\/after|before after|referral|proof|social/.test(text);
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
    totalProofAssets: data.items.length,
    groupedByStatus: groupCount(data.items.map((item) => item.proof.status)),
    groupedByType: groupCount(data.items.map((item) => item.proof.type)),
    latestProofAssets: items.slice(0, 20),
    items
  });
}
