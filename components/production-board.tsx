import Link from "next/link";
import { CalendarClock, CheckCircle2, Factory, Hammer, Mail, MessageCircle, Paintbrush, Truck, WalletCards } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { Panel, SectionHeading } from "@/components/ui";
import { scheduleInstallationAction } from "@/lib/actions";
import type { PaymentView, ProductionJobView, ProofAssetView } from "@/lib/db-data";
import { Lead, Quote } from "@/lib/mock-data";
import { getProductionSummary, productionStatusLabel } from "@/lib/production-intelligence";
import { currency, formatDate } from "@/lib/utils";

type ProductionBoardItem = {
  job: ProductionJobView;
  lead: Lead;
  quote: Quote;
  payments: PaymentView[];
  proofAssets?: ProofAssetView[];
};

type ProductionBoardProps = {
  items: ProductionBoardItem[];
  source?: "database" | "fallback";
};

const columns = [
  ["READY_TO_START", "Ready to Start"],
  ["DESIGN_ARTWORK", "Design / Artwork"],
  ["PRINTING_FABRICATION", "Printing / Fabrication"],
  ["INSTALLATION_SCHEDULED", "Installation Scheduled"],
  ["INSTALLED_DELIVERED", "Installed / Delivered"],
  ["AWAITING_BALANCE", "Awaiting Balance"],
  ["COMPLETED", "Completed"],
  ["REVIEW_REQUESTED", "Review Requested"]
] as const;

function priorityClass(priority: string) {
  if (priority === "URGENT") return "border-red-300/30 bg-red-500/10 text-red-100";
  if (priority === "HIGH") return "border-aurum/40 bg-aurum/10 text-aurum";
  return "border-white/10 bg-white/8 text-slate-300";
}

function emailTriggerForProductionStatus(status: string) {
  if (status === "INSTALLATION_SCHEDULED") return "INSTALLATION_SCHEDULED";
  if (status === "INSTALLED_DELIVERED" || status === "AWAITING_BALANCE") return "BALANCE_REMINDER";
  if (status === "COMPLETED" || status === "REVIEW_REQUESTED") return "REVIEW_REQUEST";
  if (status === "READY_TO_START" || status === "DESIGN_ARTWORK" || status === "PRINTING_FABRICATION") return "PRODUCTION_STARTED";
  return "CUSTOM";
}
function ProductionCard({ item }: { item: ProductionBoardItem }) {
  const { job, lead, quote, payments, proofAssets = [] } = item;
  const summary = getProductionSummary(job, quote, payments);
  const reviewProof = proofAssets.find((proof) => proof.type === "REVIEW_REQUEST");
  const reviewRequested = job.status === "REVIEW_REQUESTED" || reviewProof?.status === "REQUESTED" || reviewProof?.status === "RECEIVED" || reviewProof?.status === "DRAFTED" || reviewProof?.status === "PUBLISHED";
  const canComplete = !["COMPLETED", "REVIEW_REQUESTED", "CANCELLED"].includes(job.status);
  const canRequestReview = !reviewRequested;

  return (
    <div className="rounded-lg border border-white/10 bg-obsidian/70 p-4 shadow-glow/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-white">{job.title}</p>
          <p className="mt-1 text-xs text-mercury">{lead.businessName} - {lead.name}</p>
        </div>
        <span className={`rounded-lg border px-2 py-1 text-[11px] font-black ${priorityClass(job.priority)}`}>{job.priority}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <span>Quote: <b className="text-white">{quote.quoteNumber}</b></span>
        <span>Status: <b className="text-white">{productionStatusLabel(job.status)}</b></span>
        <span>Total: <b className="text-white">{currency(summary.payment.quoteTotal)}</b></span>
        <span>Paid: <b className="text-white">{currency(summary.payment.amountPaid)}</b></span>
        <span>Balance: <b className="text-white">{currency(summary.payment.balanceRemaining)}</b></span>
        <span>Due: <b className="text-white">{formatDate(job.dueDate)}</b></span>
        <span className="col-span-2">Install: <b className="text-white">{formatDate(job.installationDate)}</b></span>
        <span className="col-span-2">Proof: <b className="text-white">{proofAssets.length ? proofAssets.map((proof) => proof.status).join(", ") : "Not started"}</b></span>
      </div>

      <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-slate-200">{summary.suggestedNextAction}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/leads/${lead.id}`} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white">View Lead</Link>
        <Link href={`/quotes/${quote.id}`} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white">View Quote</Link>
        <ActionButton action="create-email-draft" leadId={lead.id} quoteId={quote.id} jobId={job.id} trigger={emailTriggerForProductionStatus(job.status)} contextType="production" className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" title="Create email draft"><Mail size={14} className="inline" /> Email Draft</ActionButton>
        <ActionButton action="start-production" jobId={job.id} className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian"><Factory size={14} className="inline" /> Start Production</ActionButton>
        <ActionButton action="design-artwork" jobId={job.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><Paintbrush size={14} className="inline" /> Mark Design Approved</ActionButton>
        <ActionButton action="printing-fabrication" jobId={job.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><Hammer size={14} className="inline" /> Mark In Fabrication</ActionButton>
        <ActionButton action="installed-delivered" jobId={job.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><Truck size={14} className="inline" /> Mark Installed</ActionButton>
        <ActionButton action="request-balance" jobId={job.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><WalletCards size={14} className="inline" /> Request Balance</ActionButton>
        {canComplete ? <ActionButton action="production-completed" jobId={job.id} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-obsidian"><CheckCircle2 size={14} className="inline" /> Mark Completed</ActionButton> : null}
        {canRequestReview ? <ActionButton action="request-review" jobId={job.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><MessageCircle size={14} className="inline" /> Request Review</ActionButton> : <Link href="/proof" className="rounded-lg bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-200">Review Requested</Link>}
      </div>

      <form action={scheduleInstallationAction} className="mt-4 grid gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-3">
        <input type="hidden" name="jobId" value={job.id} />
        <label className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">Schedule installation</label>
        <div className="grid gap-2 sm:grid-cols-[1fr_1.2fr_auto]">
          <input name="installationDate" type="date" required className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-950" />
          <input name="notes" placeholder="Install notes" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-950 placeholder:text-slate-400" />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><CalendarClock size={14} /> Schedule</button>
        </div>
      </form>
    </div>
  );
}

export function ProductionBoard({ items, source = "database" }: ProductionBoardProps) {
  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading
          eyebrow="Production"
          title="Production job board"
          description="Deposit-confirmed work moves from ready-to-start through design, fabrication, installation, balance collection, completion, reviews, and content creation."
        />
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">Source: {source === "database" ? "Database" : "Fallback"}</span>
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">Jobs: {items.length}</span>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
        {columns.map(([status, label]) => {
          const columnItems = items.filter((item) => item.job.status === status);
          return (
            <section key={status} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">{label}</h2>
                <span className="rounded-lg bg-white/10 px-2 py-1 text-xs font-black text-mercury">{columnItems.length}</span>
              </div>
              <div className="space-y-3">
                {columnItems.map((item) => <ProductionCard key={item.job.id} item={item} />)}
                {columnItems.length === 0 ? <p className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-mercury">No production jobs in this stage. Jobs enter production after a quote reaches the deposit threshold.</p> : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}






