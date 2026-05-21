import { NextResponse } from "next/server";
import { getQuoteCreateData } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  try {
    const { leadId } = await params;
    const data = await getQuoteCreateData(leadId);

    return NextResponse.json({
      ok: true,
      source: data.source,
      leadId,
      lead: data.selectedLead,
      assets: data.assets,
      suggestedLineItems: data.suggestedLineItems,
      existingQuotes: data.existingQuotes,
      latestActivities: data.activities
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown quote-from-lead debug error"
    }, { status: 500 });
  }
}