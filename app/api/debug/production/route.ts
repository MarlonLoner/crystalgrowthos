import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProductionBoardData } from "@/lib/db-data";
import { getProductionSummary } from "@/lib/production-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getProductionBoardData();
  const leadIds = data.jobs.map((item) => item.lead.id);
  const recentActivities = leadIds.length
    ? await prisma.followUpActivity.findMany({
        where: { leadId: { in: leadIds } },
        orderBy: { createdAt: "desc" },
        take: 40
      })
    : [];

  return NextResponse.json({
    ok: true,
    source: data.source,
    count: data.jobs.length,
    jobs: data.jobs.map((item) => ({
      job: item.job,
      lead: item.lead,
      quote: item.quote,
      payments: item.payments,
      summary: getProductionSummary(item.job, item.quote, item.payments),
      recentActivities: recentActivities.filter((activity) => activity.leadId === item.lead.id).slice(0, 6)
    }))
  });
}
