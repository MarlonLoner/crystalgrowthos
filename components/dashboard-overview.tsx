import { CalendarCheck2, Factory, Flame, Image, PenLine, ReceiptText, Send, ShieldCheck, Target, Trophy, UsersRound, WalletCards } from "lucide-react";
import { Lead, Quote, quoteFinalTotal } from "@/lib/mock-data";
import { getRevenueMetrics, RevenueActivity } from "@/lib/revenue-intelligence";
import type { ContentPostView, LeadAssetView, PaymentView, ProductionJobView, ProofAssetView } from "@/lib/db-data";
import { currency } from "@/lib/utils";

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function DashboardOverview({ leads, quotes, activities, assets = [], payments = [], productionJobs = [], proofAssets = [], contentPosts = [] }: { leads: Lead[]; quotes: Quote[]; activities: RevenueActivity[]; assets?: LeadAssetView[]; payments?: PaymentView[]; productionJobs?: ProductionJobView[]; proofAssets?: ProofAssetView[]; contentPosts?: ContentPostView[] }) {
  const metrics = getRevenueMetrics(leads, quotes, activities);
  const needingContact = leads.filter((lead) => !lead.lastContactedAt || new Date(lead.nextFollowUpDate) <= new Date("2026-05-18")).length;

  const mockupRequests = leads.filter((lead) => /shopfront|mockup/i.test(`${lead.source} ${lead.serviceInterestedIn}`)).length;
  const depositsReceived = quotes.filter((quote) => payments.filter((payment) => payment.quoteId === quote.id).reduce((sum, payment) => sum + payment.amount, 0) >= quoteFinalTotal(quote) * 0.6).length;
  const activeProduction = productionJobs.filter((job) => !["COMPLETED", "REVIEW_REQUESTED", "CANCELLED"].includes(job.status)).length;
  const activeProof = proofAssets.filter((proof) => !["PUBLISHED", "ARCHIVED"].includes(proof.status)).length;
  const activeContent = contentPosts.filter((post) => ["DRAFTED", "READY", "SCHEDULED"].includes(post.status)).length;
  const outstandingBalance = quotes.reduce((sum, quote) => {
    const paid = payments.filter((payment) => payment.quoteId === quote.id).reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
    return sum + Math.max(quoteFinalTotal(quote) - paid, 0);
  }, 0);

  const snapshot = [
    ["New leads", leads.filter((lead) => lead.status === "New Lead").length.toString(), UsersRound, "/leads"],
    ["Mockup requests", mockupRequests.toString(), Image, "/mockups"],
    ["Quotes sent", quotes.filter((quote) => quote.status === "Sent").length.toString(), ReceiptText, "/quotes"],
    ["Deposits received", depositsReceived.toString(), WalletCards, "/quotes"],
    ["Production active", activeProduction.toString(), Factory, "/production"],
    ["Proof active", activeProof.toString(), ShieldCheck, "/proof"],
    ["Content queued", activeContent.toString(), PenLine, "/content-calendar"],
    ["Outstanding balance", currency(outstandingBalance), WalletCards, "/money-today"]
  ] as const;

  const lifecycle = [
    ["Lead Capture", leads.length, "Capture", "/intake/inbox"],
    ["Mockup", mockupRequests, "Assets and design", "/mockups"],
    ["Quote", quotes.length, "Pricing", "/quotes"],
    ["Payment", payments.length, "Cash tracking", "/money-today"],
    ["Production", productionJobs.length, "Delivery", "/production"],
    ["Proof", proofAssets.length, "Trust assets", "/proof"],
    ["Content", contentPosts.length, "Publishing", "/content-calendar"]
  ] as const;
  const cards = [
    ["Total leads", metrics.totalLeads.toString(), UsersRound, "/leads"],
    ["New leads this week", "5", UsersRound, "/leads/new"],
    ["Hot leads", "5", Flame, "/money-today"],
    ["Leads needing contact", needingContact.toString(), CalendarCheck2, "/money-today"],
    ["Pending quote value", currency(metrics.pendingQuoteValue), WalletCards, "/money-today"],
    ["Average quote value", currency(metrics.averageQuoteValue), Target, "/reports/revenue"],
    ["Quote acceptance rate", percent(metrics.quoteAcceptanceRate), Trophy, "/reports/revenue"],
    ["Lead-to-quote rate", percent(metrics.leadToQuoteRate), Send, "/reports/revenue"]
  ] as const;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-aurum">Business Flow Snapshot</p>
            <h2 className="mt-1 text-2xl font-black text-white">Lead to content operating loop</h2>
          </div>
          <a href="/system-health" className="rounded-lg bg-white/10 px-3 py-2 text-xs font-black text-white">System Health</a>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {snapshot.map(([label, value, Icon, href]) => (
            <a key={label} href={href} className="rounded-lg border border-white/10 bg-obsidian/60 p-4 transition hover:border-aurum/40">
              <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">{label}</span><Icon size={18} className="text-aurum" /></div>
              <p className="mt-3 text-2xl font-black text-white">{value}</p>
            </a>
          ))}
        </div>
        <div className="mt-4 grid gap-2 lg:grid-cols-7">
          {lifecycle.map(([stage, count, status, href]) => (
            <a key={stage} href={href} className="rounded-lg border border-white/10 bg-white/[0.04] p-3 transition hover:border-aurum/40">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-white">{stage}</p>
              <p className="mt-2 text-2xl font-black text-aurum">{count}</p>
              <p className="mt-1 text-xs text-mercury">{status}</p>
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-aurum">What this OS does</p>
        <div className="mt-3 grid gap-2 text-sm text-slate-200 md:grid-cols-2 xl:grid-cols-4">
          {["Captures leads", "Collects shopfront/logo assets", "Manages mockup workflow", "Creates quotes", "Tracks deposits/payments", "Moves jobs through production", "Converts completed work into proof/content", "Tracks daily actions in Money Today"].map((item) => (
            <span key={item} className="rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2">{item}</span>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, href]) => (
          <a
            key={label}
            href={href}
            className="rounded-lg border border-white/10 bg-white/[0.045] p-4 transition hover:border-aurum/40 hover:bg-white/[0.065]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-mercury">{label}</span>
              <span className="grid size-9 place-items-center rounded-lg bg-aurum/10 text-aurum">
                <Icon size={18} />
              </span>
            </div>
            <p className="mt-4 text-3xl font-black text-white">{value}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
