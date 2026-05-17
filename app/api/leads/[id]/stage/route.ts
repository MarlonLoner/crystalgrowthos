import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const statusMap: Record<string, string> = {
  "New Lead": "NEW_LEAD",
  Contacted: "CONTACTED",
  "Quote Requested": "QUOTE_REQUESTED",
  "Quote Sent": "QUOTE_SENT",
  "Follow-Up Needed": "FOLLOW_UP_NEEDED",
  Negotiating: "NEGOTIATING",
  Won: "WON",
  Lost: "LOST"
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as { stage?: string };

  if (!body.stage || !statusMap[body.stage]) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }

  try {
    const lead = await prisma.lead.update({
      where: { id },
      data: { status: statusMap[body.stage] as never }
    });

    return NextResponse.json({ lead });
  } catch {
    return NextResponse.json({ ok: true, mode: "mock", stage: body.stage });
  }
}
