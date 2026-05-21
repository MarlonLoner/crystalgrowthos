import { AlertTriangle, Brush, CheckCircle2, Edit, FilePlus2, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { ActionButton } from "@/components/action-button";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { WhatsAppScriptGenerator } from "@/components/whatsapp-script-generator";
import { buttonClass, Panel, SectionHeading } from "@/components/ui";
import { ActivityView, LeadAssetView } from "@/lib/db-data";
import { Lead, Quote, quoteFinalTotal } from "@/lib/mock-data";
import { inferMockupWorkflow, isMockupRelatedLead } from "@/lib/mockup-workflow";
import { generateWhatsAppScript } from "@/lib/scripts";
import { currency, formatDate } from "@/lib/utils";

function suggestedNextAction(lead: Lead) {
  if (!lead.lastContactedAt) return "Send a first WhatsApp response and request logo, shopfront photo, and approximate sizes.";
  if (lead.status === "Quote Sent") return "Send the quote follow-up and ask for deposit confirmation or blockers.";
  if (lead.status === "Won") return "Ask for a review, referral, or next signage refresh opportunity.";
  if (lead.status === "Lost") return "Revive gently with a lower-pressure check-in and updated offer.";
  return "Confirm timeline, decision maker, and what must happen before production can start.";
}

function activityStatus(activity: ActivityView) {
  if (activity.completedAt) return { label: "Completed", className: "bg-emerald-400/15 text-emerald-200 border-emerald-300/30" };
  if (activity.dueAt && new Date(activity.dueAt) < new Date()) return { label: "Overdue", className: "bg-red-500/15 text-red-200 border-red-300/30" };
  return { label: "Pending", className: "bg-aurum/10 text-aurum border-aurum/30" };
}

export function LeadDetail({
  lead,
  relatedQuotes,
  activities,
  assets = []
}: {
  lead: Lead;
  relatedQuotes: Quote[];
  activities: ActivityView[];
  assets?: LeadAssetView[];
}) {
  const message = generateWhatsAppScript(lead.status === "Lost" ? "dead-lead-revival" : lead.status === "Won" ? "review-request" : "quote-follow-up", lead);
  const mockupWorkflow = inferMockupWorkflow(lead, assets, activities, relatedQuotes);
  const showMockupWorkflow = isMockupRelatedLead(lead) || assets.length > 0;

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
            <Link className={buttonClass} href={`/quotes/new?leadId=${lead.id}`}><FilePlus2 size={18} /> {mockupWorkflow.status === "Ready for Quote" ? "Create Quote from Mockup" : "Create Quote"}</Link>
            <Link className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-bold text-white" href={`/leads/${lead.id}/edit`}><Edit size={18} /> Edit Lead</Link>
            <ActionButton action="mark-contacted" leadId={lead.id} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-bold text-white"><CheckCircle2 size={18} /> Mark Contacted</ActionButton>
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
            <SectionHeading eyebrow="Lead Assets" title="Asset gallery" description="Uploaded shopfront, logo, and reference files for mockup or quote preparation." />
            {assets.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {assets.map((asset) => (
                  <div key={asset.id} className="overflow-hidden rounded-lg border border-white/10 bg-obsidian/60">
                    {asset.contentType.startsWith("image/") ? <img src={asset.url} alt={asset.filename} className="h-44 w-full object-cover" /> : null}
                    <div className="space-y-2 p-4">
                      <span className="inline-flex rounded-lg bg-aurum/10 px-2.5 py-1 text-xs font-black text-aurum">{asset.type.replaceAll("_", " ")}</span>
                      <p className="break-words font-black text-white">{asset.filename}</p>
                      <p className="text-xs text-mercury">{asset.contentType} - {asset.size ? `${Math.round(asset.size / 1024)} KB` : "URL reference"}</p>
                      {asset.notes ? <p className="text-xs leading-5 text-slate-400">{asset.notes}</p> : null}
                      <a href={asset.url} target="_blank" rel="noreferrer" className="inline-flex rounded-lg bg-white/10 px-3 py-2 text-xs font-black text-white hover:bg-white/15">Open asset</a>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-mercury">No assets uploaded yet.</p>}
          </Panel>

                    {showMockupWorkflow ? (
            <Panel>
              <SectionHeading eyebrow="Mockup Workflow" title="Shopfront mockup production" description="Track assets, design movement, mockup sending, and quote readiness for this lead." />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-white/10 bg-obsidian/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">Status</p><p className="mt-2 font-black text-white">{mockupWorkflow.status}</p></div>
                <div className="rounded-lg border border-white/10 bg-obsidian/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">Assets</p><p className="mt-2 font-black text-white">{mockupWorkflow.assetCount}</p></div>
                <div className="rounded-lg border border-white/10 bg-obsidian/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">Urgency</p><p className="mt-2 font-black text-white">{mockupWorkflow.urgency}</p></div>
                <div className="rounded-lg border border-white/10 bg-obsidian/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">Latest</p><p className="mt-2 font-black text-white">{mockupWorkflow.latestActivity?.title ?? "No activity yet"}</p></div>
              </div>
              {mockupWorkflow.missingAssets.length ? <p className="mt-4 flex items-center gap-2 rounded-lg border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100"><AlertTriangle size={16} /> {mockupWorkflow.missingAssets.join(", ")}</p> : null}
              <p className="mt-4 rounded-lg border border-white/10 bg-obsidian/60 p-4 text-sm leading-6 text-slate-200">{mockupWorkflow.suggestedNextAction}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton action="request-missing-assets" leadId={lead.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><MessageCircle size={14} className="inline" /> Request Missing Assets</ActionButton>
                <ActionButton action="mockup-in-design" leadId={lead.id} className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian"><Brush size={14} className="inline" /> Mark In Design</ActionButton>
                <ActionButton action="mockup-sent" leadId={lead.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><Send size={14} className="inline" /> Mark Mockup Sent</ActionButton>
                <ActionButton action="ready-for-quote" leadId={lead.id} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-obsidian"><CheckCircle2 size={14} className="inline" /> Mark Ready for Quote</ActionButton>
                <Link href={`/quotes/new?leadId=${lead.id}`} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><FilePlus2 size={14} className="inline" /> Create Quote</Link>
              </div>
            </Panel>
          ) : null}
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
            <SectionHeading eyebrow="Activity Timeline" title="Follow-up activities" description="Real activity records for this lead, including pending, completed, and overdue work." />
            <div className="space-y-3">
              {activities.length ? activities.map((activity) => {
                const status = activityStatus(activity);
                return (
                  <div key={activity.id} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div><p className="font-black text-white">{activity.title}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-aurum">{activity.type}</p></div>
                      <span className={`rounded-lg border px-2.5 py-1 text-xs font-black ${status.className}`}>{status.label}</span>
                    </div>
                    <p className="mt-3 text-sm text-mercury">{activity.note}</p>
                    <p className="mt-2 text-xs text-slate-500">Created {formatDate(activity.createdAt)} - Due {formatDate(activity.dueAt)} - Completed {formatDate(activity.completedAt)}</p>
                    {!activity.completedAt ? <ActionButton action="complete-follow-up" leadId={lead.id} activityId={activity.id} className="mt-3 rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-obsidian">Mark Done</ActionButton> : null}
                  </div>
                );
              }) : <p className="text-sm text-mercury">No activity logged yet.</p>}
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


