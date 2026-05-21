import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      where: { source: { contains: "Shopfront", mode: "insensitive" } },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        assets: { orderBy: { createdAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" } }
      }
    });

    return NextResponse.json({
      ok: true,
      counts: {
        leads: leads.length,
        assets: leads.reduce((total, lead) => total + lead.assets.length, 0),
        activities: leads.reduce((total, lead) => total + lead.activities.length, 0),
        pendingActivities: leads.reduce((total, lead) => total + lead.activities.filter((activity) => !activity.completedAt).length, 0)
      },
      submissions: leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        businessName: lead.businessName,
        source: lead.source,
        serviceInterestedIn: lead.serviceInterestedIn,
        status: lead.status,
        lastContactedAt: lead.lastContactedAt,
        nextFollowUpAt: lead.nextFollowUpAt,
        nextFollowUpDate: lead.nextFollowUpDate,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
        assetCount: lead.assets.length,
        assets: lead.assets,
        activityCount: lead.activities.length,
        activities: lead.activities
      }))
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown shopfront submission debug error"
    }, { status: 500 });
  }
}