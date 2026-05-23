import { NextResponse } from "next/server";
import { getProofBoardData } from "@/lib/db-data";
import { getProofSummary } from "@/lib/proof-intelligence";
import { generateProofContentDrafts } from "@/lib/proof-content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getProofBoardData();
  const leadIds = data.items.map((item) => item.lead.id);
  const recentActivities = leadIds.length
    ? await prisma.followUpActivity.findMany({ where: { leadId: { in: leadIds } }, orderBy: { createdAt: "desc" }, take: 50 })
    : [];

  return NextResponse.json({
    ok: true,
    source: data.source,
    count: data.items.length,
    items: data.items.map((item) => ({
      ...item,
      summary: getProofSummary({ lead: item.lead, quote: item.quote, job: item.productionJob, proofAssets: [item.proof] }),
      contentDrafts: generateProofContentDrafts({ lead: item.lead, quote: item.quote, job: item.productionJob }),
      recentActivities: recentActivities.filter((activity) => activity.leadId === item.lead.id).slice(0, 6)
    }))
  });
}
