import { NextResponse } from "next/server";
import { getCommunicationQueueData } from "@/lib/db-data";
import { getCommunicationSuggestedAction, hasMissingRecipientDetails } from "@/lib/communication-intelligence";

export const dynamic = "force-dynamic";

function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
}

export async function GET() {
  const data = await getCommunicationQueueData();
  const communications = data.communications.map((item) => item.communication);

  return NextResponse.json({
    ok: data.source === "database",
    source: data.source,
    total: communications.length,
    byStatus: countBy(communications.map((item) => item.status)),
    byChannel: countBy(communications.map((item) => item.channel)),
    byTrigger: countBy(communications.map((item) => item.trigger)),
    missingRecipientDetails: communications.filter(hasMissingRecipientDetails).map((item) => ({ id: item.id, channel: item.channel, trigger: item.trigger, leadId: item.leadId })),
    latestDrafts: data.communications.slice(0, 20).map((item) => ({
      communication: item.communication,
      lead: item.lead ? { id: item.lead.id, businessName: item.lead.businessName, name: item.lead.name } : null,
      quote: item.quote ? { id: item.quote.id, quoteNumber: item.quote.quoteNumber } : null,
      suggestedAction: getCommunicationSuggestedAction(item.communication)
    })),
    duplicatePrevention: "Drafts are de-duped by trigger, channel, status, and related lead/quote/job/proof/content ids."
  });
}
