import { AlertTriangle, Brush, CheckCircle2, Eye, FilePlus2, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { ActionButton } from "@/components/action-button";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { Panel, SectionHeading } from "@/components/ui";
import { ActivityView, LeadAssetView } from "@/lib/db-data";
import { Lead, Quote } from "@/lib/mock-data";
import { getMockupWorkflowItems, mockupColumns, MockupStatus } from "@/lib/mockup-workflow";
import { currency, formatDate } from "@/lib/utils";

const statusClass: Record<MockupStatus, string> = {
  "New Request": "border-sky-300/20 bg-sky-400/10 text-sky-100",
  "Needs Assets": "border-red-300/25 bg-red-500/10 text-red-100",
  "Assets Received": "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  "In Design": "border-aurum/30 bg-aurum/10 text-aurum",
  "Mockup Sent": "border-violet-300/25 bg-violet-400/10 text-violet-100",
  "Ready for Quote": "border-orange-300/30 bg-orange-400/10 text-orange-100",
  "Converted to Quote": "border-emerald-300/30 bg-emerald-400/15 text-emerald-100",
  "Dormant / Lost": "border-white/10 bg-white/7 text-slate-300"
};

export function MockupsBoard({
  leads,
  assets,
  activities,
  quotes,
  source
}: {
  leads: Lead[];
  assets: LeadAssetView[];
  activities: ActivityView[];
  quotes: Quote[];
  source: "database" | "fallback";
}) {
  const items = getMockupWorkflowItems(leads, assets, activities, quotes);
  const grouped = mockupColumns.map((column) => ({
    column,
    items: items.filter((item) => item.workflow.status === column)
  }));

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Mockup Production"
            title="Shopfront mockup board"
            description="Move uploaded shopfront requests from assets received, into design, through mockup follow-up, and into quotes."
          />
          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-obsidian/60 p-3"><p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">Requests</p><p className="mt-1 text-2xl font-black text-white">{items.length}</p></div>
            <div className="rounded-lg border border-white/10 bg-obsidian/60 p-3"><p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">Need assets</p><p className="mt-1 text-2xl font-black text-white">{grouped.find((group) => group.column === "Needs Assets")?.items.length ?? 0}</p></div>
            <div className="rounded-lg border border-white/10 bg-obsidian/60 p-3"><p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">In design</p><p className="mt-1 text-2xl font-black text-white">{grouped.find((group) => group.column === "In Design")?.items.length ?? 0}</p></div>
            <div className="rounded-lg border border-white/10 bg-obsidian/60 p-3"><p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">Ready value</p><p className="mt-1 text-2xl font-black text-white">{currency(items.filter((item) => item.workflow.status === "Ready for Quote").reduce((sum, item) => sum + item.lead.estimatedDealValue, 0))}</p></div>
          </div>
        </div>
        {source === "fallback" ? <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-200">Using fallback data. Database mockup requests appear here when PostgreSQL is reachable.</p> : null}
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
        {grouped.map(({ column, items: columnItems }) => (
          <section key={column} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <div className={`rounded-lg border px-3 py-2 text-sm font-black ${statusClass[column]}`}>{column} <span className="text-xs opacity-75">({columnItems.length})</span></div>
            <div className="mt-3 space-y-3">
              {columnItems.map(({ lead, workflow }) => (
                <article key={lead.id} className="rounded-lg border border-white/10 bg-obsidian/75 p-4 shadow-glow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-white">{lead.name}</p>
                      <p className="mt-1 text-xs text-mercury">{lead.businessName}</p>
                    </div>
                    <span className="rounded-lg bg-aurum/10 px-2 py-1 text-xs font-black text-aurum">{currency(lead.estimatedDealValue)}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-300">
                    <p>{lead.phone}</p>
                    <p>{lead.serviceInterestedIn}</p>
                    <p>{lead.source}</p>
                    <p>Urgency: <span className="font-bold text-white">{workflow.urgency}</span></p>
                    <p>Assets: <span className="font-bold text-white">{workflow.assetCount}</span></p>
                    {workflow.missingAssets.length ? <p className="flex items-center gap-1 text-red-200"><AlertTriangle size={13} /> {workflow.missingAssets.join(", ")}</p> : <p className="text-emerald-200">Shopfront and logo received</p>}
                    <p>Latest: {workflow.latestActivity ? `${workflow.latestActivity.title} (${formatDate(workflow.latestActivity.createdAt)})` : "No activity yet"}</p>
                  </div>
                  <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-slate-200">{workflow.suggestedNextAction}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/leads/${lead.id}`} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><Eye size={14} className="inline" /> View Lead</Link>
                    <WhatsAppAction phone={lead.phone} message={workflow.message} />
                    <ActionButton action="request-missing-assets" leadId={lead.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><MessageCircle size={14} className="inline" /> Request Missing Assets</ActionButton>
                    <ActionButton action="mockup-in-design" leadId={lead.id} className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian"><Brush size={14} className="inline" /> Mark In Design</ActionButton>
                    <ActionButton action="mockup-sent" leadId={lead.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><Send size={14} className="inline" /> Mark Mockup Sent</ActionButton>
                    <ActionButton action="ready-for-quote" leadId={lead.id} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-obsidian"><CheckCircle2 size={14} className="inline" /> Ready for Quote</ActionButton>
                    <Link href={`/quotes/new?lead=${lead.id}`} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><FilePlus2 size={14} className="inline" /> Create Quote</Link>
                  </div>
                </article>
              ))}
              {columnItems.length === 0 ? <p className="py-8 text-center text-sm text-mercury">No cards here.</p> : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}