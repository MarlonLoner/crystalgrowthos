"use client";

import { Copy, Mail, MessageCircle, Send, SkipForward } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ActionButton } from "@/components/action-button";
import { Panel, SectionHeading } from "@/components/ui";
import type { CommunicationView } from "@/lib/db-data";
import { communicationChannelLabel, communicationStatusLabel, communicationTriggerLabel, getCommunicationPriority, getCommunicationSuggestedAction, hasMissingRecipientDetails } from "@/lib/communication-intelligence";
import { formatDate } from "@/lib/utils";
import { createWhatsAppUrl } from "@/components/whatsapp-action";

type CommunicationQueueItem = {
  communication: CommunicationView;
  lead: { id: string; name: string; businessName: string } | null;
  quote: { id: string; quoteNumber: string } | null;
  productionJob: { id: string; title: string } | null;
  proofAsset: { id: string; title: string } | null;
  contentPost: { id: string; title: string } | null;
};

const sections = [
  { label: "Needs Review", statuses: ["DRAFT", "FAILED"] },
  { label: "Ready to Send", statuses: ["READY"] },
  { label: "Scheduled", statuses: ["SCHEDULED"] },
  { label: "Sent", statuses: ["SENT"] },
  { label: "Skipped / Suppressed", statuses: ["SKIPPED"] }
];

function waLink(phone: string, body: string) {
  return createWhatsAppUrl(phone, body);
}

function mailto(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function RelatedLinks({ item }: { item: CommunicationQueueItem }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {item.lead ? <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/leads/${item.lead.id}`}>View Lead</Link> : null}
      {item.quote ? <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/quotes/${item.quote.id}`}>View Quote</Link> : null}
      {item.productionJob ? <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href="/production">View Job</Link> : null}
      {item.proofAsset ? <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href="/proof">View Proof</Link> : null}
      {item.contentPost ? <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href="/content-calendar">View Content</Link> : null}
    </div>
  );
}

function CommunicationCard({ item, emailTestMode }: { item: CommunicationQueueItem; emailTestMode?: boolean }) {
  const [copied, setCopied] = useState(false);
  const communication = item.communication;
  const missingDetails = hasMissingRecipientDetails(communication);
  const priority = getCommunicationPriority(communication);
  const whatsAppHref = communication.channel === "WHATSAPP" && communication.recipientPhone ? waLink(communication.recipientPhone, communication.body) : "";
  const mailHref = communication.channel === "EMAIL" && communication.recipientEmail ? mailto(communication.recipientEmail, communication.subject, communication.body) : "";

  async function copyBody() {
    await navigator.clipboard.writeText(communication.body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-lg bg-aurum/10 px-2.5 py-1 text-xs font-black text-aurum">{communicationChannelLabel(communication.channel)}</span>
            <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold text-white">{communicationTriggerLabel(communication.trigger)}</span>
            <span className={`rounded-lg px-2.5 py-1 text-xs font-black ${priority === "High" ? "bg-red-500/15 text-red-200" : priority === "Medium" ? "bg-aurum/10 text-aurum" : "bg-white/10 text-slate-300"}`}>{priority}</span>
          </div>
          <p className="mt-3 font-black text-white">{communication.recipientName || item.lead?.businessName || "No recipient name"}</p>
          <p className="mt-1 text-xs text-mercury">{communication.recipientEmail || communication.recipientPhone || "Missing recipient details"}</p>
        </div>
        <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-black text-white">{communicationStatusLabel(communication.status)}</span>
        {communication.channel === "EMAIL" && emailTestMode ? <span className="rounded-lg bg-sky-400/10 px-2.5 py-1 text-xs font-black text-sky-100">Test mode</span> : null}
      </div>
      {communication.subject ? <p className="mt-4 text-sm font-black text-white">{communication.subject}</p> : null}
      <p className="mt-3 line-clamp-5 whitespace-pre-line text-sm leading-6 text-slate-200">{communication.body}</p>
      <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
        <span>Scheduled: <b className="text-white">{formatDate(communication.scheduledFor)}</b></span>
        <span>Suggested: <b className="text-white">{getCommunicationSuggestedAction(communication)}</b></span>
      </div>
      {missingDetails ? <p className="mt-3 rounded-lg border border-red-300/25 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-100">Missing recipient details for this channel.</p> : null}
      {communication.status === "SKIPPED" && communication.error ? <p className="mt-3 rounded-lg border border-sky-300/25 bg-sky-400/10 px-3 py-2 text-xs font-bold text-sky-100">{communication.error}</p> : null}
      {communication.status === "FAILED" && communication.error ? <p className="mt-3 rounded-lg border border-red-300/25 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-100">{communication.error}</p> : null}
      {communication.status === "SENT" && communication.sentAt ? <p className="mt-3 rounded-lg border border-emerald-300/25 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-100">Sent {formatDate(communication.sentAt)}</p> : null}
      <RelatedLinks item={item} />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={copyBody} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-black text-white"><Copy size={14} className="inline" /> {copied ? "Copied" : "Copy Message"}</button>
        {whatsAppHref ? <a href={whatsAppHref} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-obsidian"><MessageCircle size={14} className="inline" /> Open WhatsApp</a> : null}
        {mailHref ? <a href={mailHref} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-950"><Mail size={14} className="inline" /> Mailto</a> : null}
        {communication.channel === "EMAIL" && ["DRAFT", "READY", "SCHEDULED"].includes(communication.status) ? <ActionButton action="communication-send-email" communicationId={communication.id} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-obsidian"><Send size={14} className="inline" /> Send Email</ActionButton> : null}
        {communication.status !== "READY" && communication.status !== "SENT" ? <ActionButton action="communication-ready" communicationId={communication.id} className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian">Mark Ready</ActionButton> : null}
        {communication.status !== "SENT" ? <ActionButton action="communication-sent" communicationId={communication.id} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-obsidian"><Send size={14} className="inline" /> Mark Sent</ActionButton> : null}
        {!["SKIPPED", "SENT"].includes(communication.status) ? <ActionButton action="communication-skipped" communicationId={communication.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><SkipForward size={14} className="inline" /> Skip</ActionButton> : null}
      </div>
    </div>
  );
}

export function CommunicationQueue({ communications, emailTestMode = false }: { communications: CommunicationQueueItem[]; emailTestMode?: boolean }) {
  const activeByLead = communications.reduce<Record<string, CommunicationQueueItem[]>>((acc, item) => {
    const leadId = item.communication.leadId;
    if (!leadId || !["DRAFT", "READY"].includes(item.communication.status)) return acc;
    acc[leadId] = [...(acc[leadId] ?? []), item];
    return acc;
  }, {});
  const noisyLeads = Object.entries(activeByLead).filter(([, items]) => items.length > 1);

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading eyebrow="Client Messages" title="Communication Queue" description="Draft-first client communication with throttling, priority labels, and suppressed automation decisions." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {sections.map((section) => <div key={section.label} className="rounded-lg border border-white/10 bg-obsidian/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">{section.label}</p><p className="mt-2 text-3xl font-black text-white">{communications.filter((item) => section.statuses.includes(item.communication.status)).length}</p></div>)}
        </div>
      </Panel>
      {noisyLeads.length ? (
        <Panel>
          <SectionHeading eyebrow="Best Next Message" title={`${noisyLeads.length} clients have multiple active drafts`} description="Keep the highest-priority latest message and suppress lower-priority drafts for cleaner client handling." />
          <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {noisyLeads.map(([leadId, items]) => {
              const sorted = [...items].sort((a, b) => (getCommunicationPriority(b.communication) === "High" ? 3 : getCommunicationPriority(b.communication) === "Medium" ? 2 : 1) - (getCommunicationPriority(a.communication) === "High" ? 3 : getCommunicationPriority(a.communication) === "Medium" ? 2 : 1));
              const best = sorted[0];
              return (
                <div key={leadId} className="rounded-lg border border-aurum/20 bg-aurum/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-aurum">Best next message</p>
                  <p className="mt-2 font-black text-white">{best.lead?.businessName ?? best.communication.recipientName}</p>
                  <p className="mt-2 text-sm text-slate-200">Keep: {communicationTriggerLabel(best.communication.trigger)} ({getCommunicationPriority(best.communication)})</p>
                  <p className="mt-1 text-xs text-mercury">{items.length - 1} lower-priority draft(s) can be suppressed.</p>
                  <div className="mt-3"><ActionButton action="communication-cleanup" leadId={leadId} className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian">Clean up drafts for this client</ActionButton></div>
                </div>
              );
            })}
          </div>
        </Panel>
      ) : null}
      {sections.map((section) => {
        const items = communications.filter((item) => section.statuses.includes(item.communication.status));
        return (
          <Panel key={section.label}>
            <SectionHeading eyebrow={section.label} title={`${items.length} messages`} description="Review, copy, open, suppress, or mark messages as sent from here." />
            <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => <CommunicationCard key={item.communication.id} item={item} emailTestMode={emailTestMode} />)}
              {items.length === 0 ? <p className="text-sm text-mercury">No {section.label.toLowerCase()} communications yet. Workflow actions will create drafts automatically.</p> : null}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}



