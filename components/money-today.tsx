"use client";

import { CheckCircle2, Eye, FilePlus2, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getAiRevenueBrief, getMoneyActionItems, getRevenueMetrics, Priority } from "@/lib/revenue-intelligence";
import { getMockupWorkflowItems } from "@/lib/mockup-workflow";
import { Lead, Quote } from "@/lib/mock-data";
import type { ActivityView, CommunicationView, ContentPostView, LeadAssetView, PaymentView, ProductionJobView, ProofAssetView } from "@/lib/db-data";
import { getPaymentSummary } from "@/lib/payment-intelligence";
import { getProductionSummary } from "@/lib/production-intelligence";
import { getProofSummary } from "@/lib/proof-intelligence";
import { getContentSummary } from "@/lib/content-intelligence";
import { currency, formatDate } from "@/lib/utils";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { ActionButton } from "@/components/action-button";
import { Panel, SectionHeading } from "@/components/ui";

const priorityClass: Record<Priority, string> = {
  High: "border-red-400/30 bg-red-500/10 text-red-200",
  Medium: "border-aurum/30 bg-aurum/10 text-aurum",
  Low: "border-white/10 bg-white/8 text-slate-300"
};

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

type MoneyTodayProps = {
  leads?: Lead[];
  quotes?: Quote[];
  activities?: ActivityView[];
  assets?: LeadAssetView[];
  payments?: PaymentView[];
  productionJobs?: ProductionJobView[];
  proofAssets?: ProofAssetView[];
  contentPosts?: ContentPostView[];
  communications?: CommunicationView[];
};

export function MoneyToday({ leads = [], quotes = [], activities = [], assets = [], payments = [], productionJobs = [], proofAssets = [], contentPosts = [], communications = [] }: MoneyTodayProps) {
  const [done, setDone] = useState<string[]>([]);
  const items = useMemo(() => getMoneyActionItems(leads, quotes).filter((item) => !done.includes(item.id)), [leads, quotes, done]);
  const newEnquiryItems = useMemo(() => {
    const responseWindowMs = 4 * 60 * 60 * 1000;
    const now = Date.now();
    return leads.filter((lead) => {
      const isPublic = /Website intake|Shopfront mockup/i.test(lead.source);
      if (!isPublic || lead.lastContactedAt) return false;
      const hasCommunication = communications.some((item) => item.leadId === lead.id && ["DRAFT", "READY", "SCHEDULED", "SENT"].includes(item.status));
      const leadAssets = assets.filter((asset) => asset.leadId === lead.id);
      const missingContact = !lead.email && !lead.phone;
      const missingShopfrontAsset = /shopfront/i.test(`${lead.source} ${lead.serviceInterestedIn}`) && !leadAssets.some((asset) => asset.type === "SHOPFRONT_IMAGE");
      const missingLogo = /shopfront/i.test(`${lead.source} ${lead.serviceInterestedIn}`) && !leadAssets.some((asset) => asset.type === "LOGO");
      const olderThanWindow = lead.createdAt ? now - new Date(lead.createdAt).getTime() > responseWindowMs : false;
      return missingContact || !hasCommunication || missingShopfrontAsset || missingLogo || olderThanWindow || lead.status === "New Lead";
    }).slice(0, 8);
  }, [leads, communications, assets]);
  const mockupItems = useMemo(() => getMockupWorkflowItems(leads, assets, activities, quotes).filter((item) => !done.includes(`mockup-${item.lead.id}`)), [leads, assets, activities, quotes, done]);
  const paymentItems = useMemo(() => quotes.map((quote) => ({ quote, lead: leads.find((lead) => lead.id === quote.leadId), summary: getPaymentSummary(quote, payments.filter((payment) => payment.quoteId === quote.id)) })).filter((item) => item.lead && item.summary.paymentStatus !== "FULLY_PAID" && item.summary.paymentStatus !== "OVERPAID"), [quotes, leads, payments]);
  const productionItems = useMemo(() => productionJobs.map((job) => {
    const quote = quotes.find((item) => item.id === job.quoteId);
    const lead = leads.find((item) => item.id === job.leadId);
    if (!quote || !lead) return null;
    return { job, quote, lead, summary: getProductionSummary(job, quote, payments.filter((payment) => payment.quoteId === quote.id)) };
  }).filter((item): item is NonNullable<typeof item> => item !== null && !["COMPLETED", "CANCELLED"].includes(item.job.status)), [productionJobs, quotes, leads, payments]);
  const proofItems = useMemo(() => proofAssets.map((proof) => {
    const lead = leads.find((item) => item.id === proof.leadId);
    if (!lead || proof.status === "PUBLISHED" || proof.status === "ARCHIVED") return null;
    const job = productionJobs.find((item) => item.id === proof.productionJobId) ?? null;
    const quote = proof.quoteId ? quotes.find((item) => item.id === proof.quoteId) ?? null : null;
    return { proof, lead, job, quote, summary: getProofSummary({ lead, job, quote, proofAssets: [proof] }) };
  }).filter((item): item is NonNullable<typeof item> => item !== null), [proofAssets, leads, productionJobs, quotes]);
  const contentItems = useMemo(() => contentPosts.map((post) => {
    const lead = post.leadId ? leads.find((item) => item.id === post.leadId) ?? null : null;
    if (post.status === "PUBLISHED" || post.status === "ARCHIVED") return null;
    const summary = getContentSummary(post);
    const scheduled = post.scheduledAt ? new Date(post.scheduledAt) : null;
    const isDue = post.status !== "SCHEDULED" || !scheduled || scheduled <= new Date();
    return isDue ? { post, lead, summary } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null), [contentPosts, leads]);
  const communicationItems = useMemo(() => communications.filter((item) => {
    if (["SENT", "SKIPPED"].includes(item.status)) return false;
    if (item.status === "SCHEDULED" && item.scheduledFor) return new Date(item.scheduledFor) <= new Date();
    return ["DRAFT", "READY", "FAILED"].includes(item.status);
  }), [communications]);
  const emailCommunicationSummary = useMemo(() => {
    const now = new Date();
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    const emails = communications.filter((item) => item.channel === "EMAIL");
    return {
      dueToday: emails.filter((item) => item.status === "SCHEDULED" && item.scheduledFor && new Date(item.scheduledFor) <= endOfToday).length,
      overdue: emails.filter((item) => item.status === "SCHEDULED" && item.scheduledFor && new Date(item.scheduledFor) < now).length,
      failed: emails.filter((item) => item.status === "FAILED").length,
      ready: emails.filter((item) => ["DRAFT", "READY"].includes(item.status)).length
    };
  }, [communications]);
  const metrics = getRevenueMetrics(leads, quotes, activities);
  const brief = getAiRevenueBrief(leads, quotes);

  const cards = [
    ["Pending Quote Value", currency(metrics.pendingQuoteValue)],
    ["Overdue Quote Value", currency(metrics.overdueQuoteValue)],
    ["Hot Lead Value", currency(metrics.hotLeadValue)],
    ["Won Revenue This Month", currency(metrics.wonRevenueThisMonth)],
    ["Lost Opportunity Value", currency(metrics.lostOpportunityValue)],
    ["Average Quote Value", currency(metrics.averageQuoteValue)],
    ["Quote Acceptance Rate", percent(metrics.quoteAcceptanceRate)],
    ["Lead-to-Quote Rate", percent(metrics.leadToQuoteRate)],
    ["Quote-to-Win Rate", percent(metrics.quoteToWinRate)]
  ];

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading
          eyebrow="Money Today"
          title="What money should we chase today?"
          description="A daily command center for due follow-ups, quote responses, hot opportunities, dormant customers, birthdays, and WhatsApp actions."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">{label}</p>
              <p className="mt-3 text-2xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionHeading
          eyebrow="Launch Intake"
          title={`${newEnquiryItems.length} new enquiries requiring response`}
          description="Fresh public enquiries, missing contact details, missing mockup assets, or missing communication drafts that should be handled before traffic scales."
        />
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
          {newEnquiryItems.map((lead) => {
            const leadAssets = assets.filter((asset) => asset.leadId === lead.id);
            const hasDraft = communications.some((item) => item.leadId === lead.id && ["DRAFT", "READY", "SCHEDULED", "SENT"].includes(item.status));
            const missing = [
              !lead.email && !lead.phone ? "missing contact" : "",
              !hasDraft ? "missing communication draft" : "",
              /shopfront/i.test(`${lead.source} ${lead.serviceInterestedIn}`) && !leadAssets.some((asset) => asset.type === "SHOPFRONT_IMAGE") ? "missing shopfront image" : "",
              /shopfront/i.test(`${lead.source} ${lead.serviceInterestedIn}`) && !leadAssets.some((asset) => asset.type === "LOGO") ? "missing logo" : ""
            ].filter(Boolean);
            return (
              <div key={lead.id} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
                <p className="font-black text-white">{lead.businessName}</p>
                <p className="mt-1 text-xs text-mercury">{lead.name} - {lead.serviceInterestedIn}</p>
                <p className="mt-3 text-xs text-slate-400">Source: {lead.source}</p>
                {missing.length ? <p className="mt-2 text-xs font-bold text-aurum">{missing.join(", ")}</p> : <p className="mt-2 text-xs font-bold text-emerald-200">Ready for first response</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/leads/${lead.id}`}>View Lead</Link>
                  <Link className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian" href="/intake/inbox">Intake Inbox</Link>
                </div>
              </div>
            );
          })}
          {newEnquiryItems.length === 0 ? <p className="text-sm text-mercury">No fresh public enquiries need special launch attention right now.</p> : null}
        </div>
      </Panel>

      <Panel>
        <SectionHeading
          eyebrow="Quote & Payment Actions"
          title={`${paymentItems.length} quotes need cash movement`}
          description="Sent, accepted, and partially paid quotes that need deposit requests, balance collection, or payment confirmation."
        />
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {paymentItems.map(({ quote, lead, summary }) => (
            <div key={quote.id} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{quote.quoteNumber}</p>
                  <p className="mt-1 text-xs text-mercury">{lead?.businessName ?? quote.businessName} - {quote.serviceCategory}</p>
                </div>
                <span className="rounded-lg bg-aurum/10 px-2 py-1 text-xs font-black text-aurum">{summary.paymentStatus.replaceAll("_", " ")}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                <span>Total: <b className="text-white">{currency(summary.quoteTotal)}</b></span>
                <span>Paid: <b className="text-white">{currency(summary.amountPaid)}</b></span>
                <span>Deposit: <b className="text-white">{currency(summary.depositRequiredAmount)}</b></span>
                <span>Balance: <b className="text-white">{currency(summary.balanceRemaining)}</b></span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-200">{summary.suggestedNextAction}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/quotes/${quote.id}`}>View Quote</Link>
                {lead ? <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/leads/${lead.id}`}>View Lead</Link> : null}
              </div>
            </div>
          ))}
          {paymentItems.length === 0 ? <p className="text-sm text-mercury">No quote or payment actions waiting right now.</p> : null}
        </div>
      </Panel>
      <Panel>
        <SectionHeading
          eyebrow="Production Actions"
          title={`${productionItems.length} production jobs need movement`}
          description="Deposit-confirmed jobs that need design, fabrication, installation, balance collection, reviews, or content tasks."
        />
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {productionItems.map(({ job, quote, lead, summary }) => (
            <div key={job.id} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{job.title}</p>
                  <p className="mt-1 text-xs text-mercury">{lead.businessName} - {quote.quoteNumber}</p>
                </div>
                <span className="rounded-lg bg-emerald-400/10 px-2 py-1 text-xs font-black text-emerald-200">{summary.statusLabel}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                <span>Total: <b className="text-white">{currency(summary.payment.quoteTotal)}</b></span>
                <span>Balance: <b className="text-white">{currency(summary.payment.balanceRemaining)}</b></span>
                <span>Priority: <b className="text-white">{job.priority}</b></span>
                <span>Due: <b className="text-white">{formatDate(job.dueDate)}</b></span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-200">{summary.suggestedNextAction}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/quotes/${quote.id}`}>View Quote</Link>
                <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/leads/${lead.id}`}>View Lead</Link>
                <Link className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian" href="/production">Open Production</Link>
              </div>
            </div>
          ))}
          {productionItems.length === 0 ? <p className="text-sm text-mercury">No production jobs need action right now.</p> : null}
        </div>
      </Panel>
      <Panel>
        <SectionHeading
          eyebrow="Proof & Content Actions"
          title={`${proofItems.length} review and content actions`}
          description="Completed work that can become reviews, testimonials, referrals, before/after posts, or case studies."
        />
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {proofItems.map(({ proof, lead, summary }) => (
            <div key={proof.id} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{proof.title}</p>
                  <p className="mt-1 text-xs text-mercury">{lead.businessName} - {lead.name}</p>
                </div>
                <span className="rounded-lg bg-aurum/10 px-2 py-1 text-xs font-black text-aurum">{proof.status}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-200">{summary.suggestedNextAction}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/leads/${lead.id}`}>View Lead</Link>
                <Link className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian" href="/proof">Open Proof Engine</Link>
              </div>
            </div>
          ))}
          {proofItems.length === 0 ? <p className="text-sm text-mercury">No review or content actions waiting right now.</p> : null}
        </div>
      </Panel>
      <Panel>
        <SectionHeading
          eyebrow="Content Publishing Actions"
          title={`${contentItems.length} content posts need movement`}
          description="Proof-driven drafts, ready posts, and scheduled posts that can be published to keep Crystal visible."
        />
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {contentItems.map(({ post, lead, summary }) => (
            <div key={post.id} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{post.title}</p>
                  <p className="mt-1 text-xs text-mercury">{lead?.businessName ?? "No lead linked"} - {post.platform.replaceAll("_", " ")}</p>
                </div>
                <span className="rounded-lg bg-aurum/10 px-2 py-1 text-xs font-black text-aurum">{post.status}</span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-200">{post.caption}</p>
              <p className="mt-3 text-xs font-bold text-aurum">{summary.suggestedNextAction}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {lead ? <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/leads/${lead.id}`}>View Lead</Link> : null}
                <Link className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian" href="/content-calendar">Open Content Calendar</Link>
              </div>
            </div>
          ))}
          {contentItems.length === 0 ? <p className="text-sm text-mercury">No content publishing actions waiting right now.</p> : null}
        </div>
      </Panel>
      <Panel>
        <SectionHeading
          eyebrow="Communication Actions"
          title={`${communicationItems.length} client messages need review`}
          description="Drafts, ready messages, failed messages, and scheduled client communication due today."
        />
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Scheduled emails due today", emailCommunicationSummary.dueToday],
            ["Overdue scheduled emails", emailCommunicationSummary.overdue],
            ["Failed email sends", emailCommunicationSummary.failed],
            ["Ready emails not scheduled/sent", emailCommunicationSummary.ready]
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-obsidian/60 p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-mercury">{label}</p>
              <p className="mt-2 text-2xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {communicationItems.map((communication) => {
            const lead = communication.leadId ? leads.find((item) => item.id === communication.leadId) : null;
            return (
              <div key={communication.id} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-white">{communication.trigger.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-xs text-mercury">{communication.recipientName || lead?.businessName || "No recipient"} - {communication.channel}</p>
                  </div>
                  <span className="rounded-lg bg-aurum/10 px-2 py-1 text-xs font-black text-aurum">{communication.status}</span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-200">{communication.body}</p>
                <p className="mt-3 text-xs text-slate-400">Scheduled {formatDate(communication.scheduledFor)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {lead ? <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/leads/${lead.id}`}>View Lead</Link> : null}
                  <Link className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian" href="/communication">Open Queue</Link>
                </div>
              </div>
            );
          })}
          {communicationItems.length === 0 ? <p className="text-sm text-mercury">No client communication drafts need action right now.</p> : null}
        </div>
      </Panel>
      <Panel className="border-aurum/20 bg-aurum/10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-aurum">Mock AI Revenue Brief</p>
        <p className="mt-3 text-xl font-black leading-8 text-white">{brief.summary}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Biggest opportunity", brief.biggestOpportunity],
            ["Money needing follow-up", currency(brief.totalChaseValue)],
            ["Highest priority", brief.highestPriority],
            ["Best next action", brief.bestNextAction]
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">{label}</p>
              <p className="mt-2 font-black text-white">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-200">Biggest risk: {brief.biggestRisk}</p>
      </Panel>

            <Panel>
        <SectionHeading
          eyebrow="Mockup Production Actions"
          title={`${mockupItems.length} mockup actions to move forward`}
          description="Shopfront leads that need assets, design movement, mockup sending, follow-up, or quote creation."
        />
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {mockupItems.map(({ lead, workflow }) => (
            <div key={lead.id} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-black text-white">{lead.businessName}</p><p className="mt-1 text-xs text-mercury">{lead.name} - {lead.serviceInterestedIn}</p></div>
                <span className="rounded-lg bg-aurum/10 px-2 py-1 text-xs font-black text-aurum">{workflow.status}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-200">{workflow.suggestedNextAction}</p>
              {workflow.missingAssets.length ? <p className="mt-2 text-xs font-bold text-red-200">{workflow.missingAssets.join(", ")}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <WhatsAppAction phone={lead.phone} message={workflow.message} />
                <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/leads/${lead.id}`}><Eye size={14} className="inline" /> View Lead</Link>
                <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/quotes/new?leadId=${lead.id}`}><FilePlus2 size={14} className="inline" /> Create Quote</Link>
                <button type="button" onClick={() => setDone((current) => [...current, `mockup-${lead.id}`])} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-obsidian"><CheckCircle2 size={14} className="inline" /> Hide Today</button>
              </div>
            </div>
          ))}
          {mockupItems.length === 0 ? <p className="text-sm text-mercury">No mockup production actions waiting right now.</p> : null}
        </div>
      </Panel>
<Panel>
        <SectionHeading
          eyebrow="Sales Actions"
          title={`${items.length} revenue actions remaining`}
          description="Each item includes why it matters, what to do next, and WhatsApp execution buttons."
        />
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="min-w-[1320px] w-full text-left text-sm">
            <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.14em] text-mercury">
              <tr>
                {["Lead", "Phone", "Service", "Source", "Status", "Estimated", "Quote", "Last contacted", "Next follow-up", "Reason", "Priority", "Recommended action", "Actions"].map((header) => (
                  <th key={header} className="px-4 py-3 font-bold">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.map((item) => (
                <tr key={item.id} className="bg-obsidian/35 align-top text-slate-200">
                  <td className="px-4 py-4"><p className="font-black text-white">{item.lead.name}</p><p className="mt-1 text-xs text-mercury">{item.lead.businessName}</p></td>
                  <td className="px-4 py-4">{item.lead.phone}</td>
                  <td className="px-4 py-4">{item.lead.serviceInterestedIn}</td>
                  <td className="px-4 py-4">{item.lead.source}</td>
                  <td className="px-4 py-4"><span className="rounded-lg bg-aurum/10 px-2.5 py-1 text-xs font-bold text-aurum">{item.lead.status}</span></td>
                  <td className="px-4 py-4 font-bold">{currency(item.lead.estimatedDealValue)}</td>
                  <td className="px-4 py-4">{item.quote ? currency(item.quoteValue) : "No quote"}</td>
                  <td className="px-4 py-4">{formatDate(item.lead.lastContactedAt)}</td>
                  <td className="px-4 py-4">{formatDate(item.lead.nextFollowUpDate)}</td>
                  <td className="px-4 py-4 text-mercury">{item.reason}</td>
                  <td className="px-4 py-4"><span className={`rounded-lg border px-2.5 py-1 text-xs font-black ${priorityClass[item.priority]}`}>{item.priority}</span></td>
                  <td className="px-4 py-4"><p className="font-bold text-white">{item.suggestedAction.title}</p><p className="mt-1 text-xs leading-5 text-mercury">{item.suggestedAction.reason}</p></td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <WhatsAppAction phone={item.lead.phone} message={item.suggestedAction.message} />
                      <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/leads/${item.lead.id}`}><Eye size={14} className="inline" /> View Lead</Link>
                      <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/quotes/new?leadId=${item.lead.id}`}><FilePlus2 size={14} className="inline" /> Create Quote</Link>
                      {item.quote ? <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/quotes/${item.quote.id}`}><ReceiptText size={14} className="inline" /> View Quote</Link> : null}
                      <ActionButton action="complete-follow-up" leadId={item.lead.id} note={item.reason} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-obsidian"><CheckCircle2 size={14} className="inline" /> Mark Done</ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
















