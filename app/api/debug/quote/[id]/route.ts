import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function quoteNumberFromDemoId(quoteId: string) {
  const match = quoteId.match(/^quote-(\d+)$/);
  if (!match) return null;
  return `CBS-2026-${match[1].padStart(3, "0")}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quoteNumber = quoteNumberFromDemoId(id) ?? (id.startsWith("CBS-") ? id : null);

  try {
    const quote = await prisma.quote.findFirst({
      where: quoteNumber ? { quoteNumber } : { id },
      include: {
        lead: {
          include: {
            activities: { orderBy: { createdAt: "desc" } }
          }
        },
        lineItems: true
      }
    });

    return NextResponse.json({
      ok: true,
      inputId: id,
      resolvedBy: quoteNumber ? "quoteNumber" : "id",
      quote,
      quoteStatus: quote?.status ?? null,
      relatedLeadStatus: quote?.lead.status ?? null,
      relatedFollowUpActivities: quote?.lead.activities ?? []
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        inputId: id,
        resolvedBy: quoteNumber ? "quoteNumber" : "id",
        error: error instanceof Error ? error.message : "Unknown database error"
      },
      { status: 500 }
    );
  }
}
