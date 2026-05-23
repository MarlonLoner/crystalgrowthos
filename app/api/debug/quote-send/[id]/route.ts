import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function quoteNumberFromDemoId(quoteId: string) {
  const match = quoteId.match(/^quote-(\d+)$/);
  if (!match) return null;
  return `CBS-2026-${match[1].padStart(3, "0")}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const quoteNumber = quoteNumberFromDemoId(id) ?? (id.startsWith("CBS-") ? id : null);
    const quote = await prisma.quote.findFirst({
      where: quoteNumber ? { quoteNumber } : { id },
      include: {
        lineItems: true,
        lead: {
          include: {
            activities: { orderBy: { createdAt: "desc" } }
          }
        }
      }
    });

    if (!quote) {
      return NextResponse.json({ ok: false, error: `Quote not found for ${id}` }, { status: 404 });
    }

    const quoteSentActivities = quote.lead.activities.filter((activity) => activity.title.toLowerCase().includes("quote sent"));
    const pendingQuoteFollowUps = quote.lead.activities.filter((activity) => activity.title.toLowerCase().includes("follow up on quote") && !activity.completedAt);

    return NextResponse.json({
      ok: true,
      inputId: id,
      printUrl: `/quotes/${quote.id}/print`,
      publicUrl: `/q/${encodeURIComponent(quote.quoteNumber)}`,
      quote,
      lead: quote.lead,
      quoteStatus: quote.status,
      relatedQuoteSentActivities: quoteSentActivities,
      pendingQuoteFollowUpActivities: pendingQuoteFollowUps
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown quote send debug error"
    }, { status: 500 });
  }
}