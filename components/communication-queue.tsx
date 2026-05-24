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

const statuses = ["DRAFT", "READY", "SCHEDULED", "SENT", "FAILED", "SKIPPED"];

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

function CommunicationCard({ item }: { item: CommunicationQueueItem }) {
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
      </div>
      {communication.subject ? <p className="mt-4 text-sm font-black text-white">{communication.subject}</p> : null}
      <p className="mt-3 line-clamp-5 whitespace-pre-line text-sm leading-6 text-slate-200">{communication.body}</p>
      <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
        <span>Scheduled: <b className="text-white">{formatDate(communication.scheduledFor)}</b></span>
        <span>Suggested: <b className="text-white">{getCommunicationSuggestedAction(communication)}</b></span>
      </div>
      {missingDetails ? <p className="mt-3 rounded-lg border border-red-300/25 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-100">Missing recipient details for this channel.</p> : null}
      <RelatedLinks item={item} />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={copyBody} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-black text-white"><Copy size={14} className="inline" /> {copied ? "Copied" : "Copy Message"}</button>
        {whatsAppHref ? <a href={whatsAppHref} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-obsidian"><MessageCircle size={14} className="inline" /> Open WhatsApp</a> : null}
        {mailHref ? <a href={mailHref} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-950"><Mail size={14} className="inline" /> Mailto</a> : null}
        {communication.status !== "READY" && communication.status !== "SENT" ? <ActionButton action="communication-ready" communicationId={communication.id} className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian">Mark Ready</ActionButton> : null}
        {communication.status !== "SENT" ? <ActionButton action="communication-sent" communicationId={communication.id} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-obsidian"><Send size={14} className="inline" /> Mark Sent</ActionButton> : null}
        {!["SKIPPED", "SENT"].includes(communication.status) ? <ActionButton action="communication-skipped" communicationId={communication.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><SkipForward size={14} className="inline" /> Skip</ActionButton> : null}
      </div>
    </div>
  );
}

export function CommunicationQueue({ communications }: { communications: CommunicationQueueItem[] }) {
  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading eyebrow="Client Messages" title="Communication Queue" description="Draft-first client communication for leads, mockups, quotes, payments, production, reviews, referrals, and content permission." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {statuses.map((status) => <div key={status} className="rounded-lg border border-white/10 bg-obsidian/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">{communicationStatusLabel(status)}</p><p className="mt-2 text-3xl font-black text-white">{communications.filter((item) => item.communication.status === status).length}</p></div>)}
        </div>
      </Panel>
      {statuses.map((status) => {
        const items = communications.filter((item) => item.communication.status === status);
        return (
          <Panel key={status}>
            <SectionHeading eyebrow={communicationStatusLabel(status)} title={`${items.length} messages`} description="Review, copy, open, or mark messages as sent from here." />
            <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => <CommunicationCard key={item.communication.id} item={item} />)}
              {items.length === 0 ? <p className="text-sm text-mercury">No {communicationStatusLabel(status).toLowerCase()} communications yet. Workflow actions will create drafts automatically.</p> : null}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

