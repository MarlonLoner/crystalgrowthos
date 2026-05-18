import { CheckCircle2, Edit, FilePlus2 } from "lucide-react";
import Link from "next/link";
import { Lead, followUpActivities, quotes, quoteFinalTotal } from "@/lib/mock-data";
import { generateWhatsAppScript } from "@/lib/scripts";
import { currency, formatDate } from "@/lib/utils";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { WhatsAppScriptGenerator } from "@/components/whatsapp-script-generator";
import { buttonClass, Panel, SectionHeading } from "@/components/ui";

function suggestedNextAction(lead: Lead) {
  if (!lead.lastContactedAt) return "Send a first WhatsApp response and request logo, shopfront photo, and approximate sizes.";
  if (lead.status === "Quote Sent") return "Send the quote follow-up and ask for deposit confirmation or blockers.";
  if (lead.status === "Won") return "Ask for a review, referral, or next signage refresh opportunity.";
  if (lead.status === "Lost") return "Revive gently with a lower-pressure check-in and updated offer.";
  return "Confirm timeline, decision maker, and what must happen before production can start.";
}

export function LeadDetail({ lead }: { lead: Lead }) {
  const relatedQuotes = quotes.filter((quote) => quote.leadId === lead.id);
  const activities = followUpActivities.filter((activity) => activity.leadId === lead.id);
  const message = generateWhatsAppScript(lead.status === "Lost" ? "dead-lead-revival" : lead.status === "Won" ? "review-request" : "quote-follow-up", lead);

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-aurum">Lead Detail</p>
            <h1 className="mt-2 text-4xl font-black text-white">{lead.name}</h1>
            <p className="mt-2 text-mercury">{lead.businessName} - {lead.serviceInterestedIn}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className={buttonClass} href={`/quotes/new?lead=${lead.id}`}><FilePlus2 size={18} /> Create Quote</Link>
            <Link className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-bold text-white" href={`/leads/${lead.id}/edit`}><Edit size={18} /> Edit Lead</Link>
            <button className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-bold text-white"><CheckCircle2 size={18} /> Mark Contacted</button>
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <div className="space-y-5">
          <Panel>
            <SectionHeading eyebrow="Full Information" title="Lead profile" description="Everything needed to decide the next sales move." />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Phone", lead.phone],
                ["Email", lead.email],
                ["Business type", lead.businessType],
                ["Source", lead.source],
                ["Status", lead.status],
                ["Deal value", currency(lead.dealValue)],
                ["Estimated value", currency(lead.estimatedDealValue)],
                ["Birthday", formatDate(lead.birthday)],
                ["Last contacted", formatDate(lead.lastContactedAt)],
                ["Next follow-up", formatDate(lead.nextFollowUpDate)]
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">{label}</p>
                  <p className="mt-2 font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-obsidian/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">Notes</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{lead.notes}</p>
            </div>
          </Panel>

          <Panel>
            <SectionHeading eyebrow="Related Quotes" title="Quote history" description="Quote value and status connected to this lead." />
            <div className="space-y-3">
              {relatedQuotes.length ? relatedQuotes.map((quote) => (
                <Link key={quote.id} href={`/quotes/${quote.id}`} className="block rounded-lg border border-white/10 bg-obsidian/60 p-4 transition hover:border-aurum/40">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="font-black text-white">{quote.quoteNumber}</p><p className="text-sm text-mercury">{quote.serviceCategory}</p></div>
                    <div className="text-left sm:text-right"><p className="font-black text-aurum">{currency(quoteFinalTotal(quote))}</p><p className="text-xs text-mercury">{quote.status}</p></div>
                  </div>
                </Link>
              )) : <p className="text-sm text-mercury">No quotes yet. Create one while the lead is warm.</p>}
            </div>
          </Panel>

          <Panel>
            <SectionHeading eyebrow="Activity" title="Follow-up activities" description="Recent and due actions connected to this opportunity." />
            <div className="space-y-3">
              {activities.length ? activities.map((activity) => (
                <div key={activity.id} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
                  <div className="flex justify-between gap-3"><p className="font-black text-white">{activity.title}</p><span className="text-xs font-bold text-aurum">{activity.type}</span></div>
                  <p className="mt-2 text-sm text-mercury">{activity.note}</p>
                  <p className="mt-2 text-xs text-slate-500">Due {formatDate(activity.dueAt)} - Completed {formatDate(activity.completedAt)}</p>
                </div>
              )) : <p className="text-sm text-mercury">No activity logged yet.</p>}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-aurum">Suggested Next Action</p>
            <p className="mt-3 text-lg font-black leading-7 text-white">{suggestedNextAction(lead)}</p>
          </Panel>
          <WhatsAppScriptGenerator lead={lead} />
          <Panel>
            <p className="text-sm font-black text-white">Action this lead on WhatsApp</p>
            <p className="mt-3 rounded-lg border border-white/10 bg-obsidian/70 p-4 text-sm leading-6 text-slate-200">{message}</p>
            <WhatsAppAction className="mt-4" phone={lead.phone} message={message} />
          </Panel>
        </div>
      </div>
    </div>
  );
}


