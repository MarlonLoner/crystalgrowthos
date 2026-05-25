import { NextResponse } from "next/server";
import { getCommunicationQueueData } from "@/lib/db-data";
import { getCommunicationSuggestedAction, hasMissingRecipientDetails } from "@/lib/communication-intelligence";
import { getEmailProviderStatus } from "@/lib/email-provider";

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
  const emailStatus = getEmailProviderStatus();
  const emailCommunications = communications.filter((item) => item.channel === "EMAIL");

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
    latestSuppressed: communications.filter((item) => item.status === "SKIPPED").slice(0, 20),
    duplicateDraftCandidates: Object.entries(communications.reduce<Record<string, typeof communications>>((acc, item) => {
      if (!item.leadId || !["DRAFT", "READY"].includes(item.status)) return acc;
      const key = `${item.leadId}:${item.channel}:${item.trigger}`;
      acc[key] = [...(acc[key] ?? []), item];
      return acc;
    }, {})).filter(([, items]) => items.length > 1).map(([key, items]) => ({ key, count: items.length, ids: items.map((item) => item.id) })),
    leadsWithMoreThanThreeDrafts: Object.entries(communications.reduce<Record<string, typeof communications>>((acc, item) => {
      if (!item.leadId || !["DRAFT", "READY"].includes(item.status)) return acc;
      acc[item.leadId] = [...(acc[item.leadId] ?? []), item];
      return acc;
    }, {})).filter(([, items]) => items.length > 3).map(([leadId, items]) => ({ leadId, count: items.length, triggers: items.map((item) => item.trigger) })),
    suggestedCleanupOpportunities: "Use the Communication Queue cleanup button for leads with multiple active drafts.",
    duplicatePrevention: "Drafts are throttled by lead, trigger, channel, priority, and recent active drafts. Suppressed drafts are audited as INTERNAL_NOTE/SKIPPED records."
  });
}




