import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [recentLeads, intakeLeads, recentActivities, counts] = await Promise.all([
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          businessName: true,
          source: true,
          serviceInterestedIn: true,
          status: true,
          lastContactedAt: true,
          nextFollowUpAt: true,
          nextFollowUpDate: true,
          estimatedDealValue: true,
          createdAt: true
        }
      }),
      prisma.lead.findMany({
        where: {
          OR: [
            { source: { contains: "Website intake", mode: "insensitive" } },
            { source: { contains: "Shopfront mockup", mode: "insensitive" } }
          ]
        },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          businessName: true,
          source: true,
          serviceInterestedIn: true,
          status: true,
          lastContactedAt: true,
          nextFollowUpAt: true,
          nextFollowUpDate: true,
          estimatedDealValue: true,
          createdAt: true
        }
      }),
      prisma.followUpActivity.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { lead: { select: { id: true, name: true, businessName: true, source: true } } }
      }),
      Promise.all([
        prisma.lead.count(),
        prisma.lead.count({
          where: {
            OR: [
              { source: { contains: "Website intake", mode: "insensitive" } },
              { source: { contains: "Shopfront mockup", mode: "insensitive" } }
            ]
          }
        }),
        prisma.lead.count({ where: { lastContactedAt: null } }),
        prisma.followUpActivity.count({ where: { completedAt: null } })
      ])
    ]);

    const [totalLeads, intakeLeadCount, uncontactedLeadCount, pendingActivityCount] = counts;

    return NextResponse.json({
      ok: true,
      counts: {
        totalLeads,
        intakeLeadCount,
        uncontactedLeadCount,
        pendingActivityCount,
        leadsPageCount: totalLeads,
        moneyTodayCandidateCount: recentLeads.filter((lead) =>
          lead.status === "NEW_LEAD" ||
          lead.lastContactedAt === null ||
          lead.nextFollowUpAt !== null ||
          lead.nextFollowUpDate !== null ||
          /Website intake|Shopfront mockup/i.test(lead.source)
        ).length
      },
      recentLeads,
      recentIntakeLeads: intakeLeads,
      recentFollowUpActivities: recentActivities
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown intake debug error"
    }, { status: 500 });
  }
}
