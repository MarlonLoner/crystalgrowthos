import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        assets: { orderBy: { createdAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" } }
      }
    });

    if (!lead) {
      return NextResponse.json({ ok: false, error: "Lead not found", leadId }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      lead,
      assets: lead.assets,
      relatedActivities: lead.activities
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      leadId,
      error: error instanceof Error ? error.message : "Unknown asset debug error"
    }, { status: 500 });
  }
}
