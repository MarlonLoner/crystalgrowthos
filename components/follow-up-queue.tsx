"use client";

import { CheckCircle2, FilePlus2, Mail, MessageCircle, MoveRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Lead, Quote, leads as mockLeads, quotes as mockQuotes, today } from "@/lib/mock-data";
import { generateEmailScript, generateWhatsAppScript } from "@/lib/scripts";
import { currency, formatDate } from "@/lib/utils";
import { Panel, SectionHeading } from "@/components/ui";
import { WhatsAppScriptGenerator } from "@/components/whatsapp-script-generator";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { ActionButton } from "@/components/action-button";

function month(value: string) {
  return new Date(value).getMonth();
}

function daysSince(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  return Math.floor((new Date(today).getTime() - new Date(value).getTime()) / 86400000);
}

function getFollowUpReason(lead: Lead, sourceQuotes: Quote[]) {
  const due = new Date(lead.nextFollowUpDate);
  const now = new Date(today);
  const hasPendingQuote = sourceQuotes.some((quote) => quote.leadId === lead.id && ["Sent", "Viewed", "Follow-Up Due"].includes(quote.status));

  if (!lead.lastContactedAt) return "Lead has not been contacted yet";
  if (due < now) return "Follow-up is overdue";
  if (lead.nextFollowUpDate === today) return "Follow-up is due today";
  if (hasPendingQuote) return "Quote sent but not accepted";
  if (lead.isCustomer && daysSince(lead.lastContactedAt) > 90) return "Dormant customer needs revival";
  if (month(lead.birthday) === month(today)) return "Birthday message due this month";
  return "Keep warm before the opportunity cools";
}

function suggestedAction(lead: Lead) {
  if (!lead.lastContactedAt) return "Send a first response and request logo, photos, or sizes.";
  if (lead.status === "Quote Sent") return "Send a quote follow-up and ask for deposit confirmation.";
  if (lead.status === "Won") return "Ask for review, referral, or next signage refresh.";
  if (lead.status === "Lost") return "Send a dead lead revival message with a lower-friction next step.";
  return "Call or WhatsApp today and move the lead to the next pipeline stage.";
}

function emailTriggerForFollowUp(lead: Lead, reason: string) {
  const text = `${lead.status} ${reason}`;
  if (/review|testimonial/i.test(text)) return "REVIEW_REQUEST";
  if (/payment|deposit/i.test(text)) return "DEPOSIT_REMINDER";
  if (/balance/i.test(text)) return "BALANCE_REMINDER";
  if (/quote/i.test(text)) return lead.status === "Quote Sent" ? "QUOTE_SENT" : "DEPOSIT_REMINDER";
  if (/mockup/i.test(text)) return "MOCKUP_SENT";
  return "CUSTOM";
}
function shouldShow(lead: Lead, sourceQuotes: Quote[]) {
  const due = new Date(lead.nextFollowUpDate) <= new Date(today);
  const hasPendingQuote = sourceQuotes.some((quote) => quote.leadId === lead.id && ["Sent", "Viewed", "Follow-Up Due"].includes(quote.status));
  const birthdayThisMonth = month(lead.birthday) === month(today);
  const dormant = lead.isCustomer && daysSince(lead.lastContactedAt) > 90;
  return !lead.lastContactedAt || due || hasPendingQuote || birthdayThisMonth || dormant;
}

export function FollowUpQueue({ leads = mockLeads, quotes = mockQuotes }: { leads?: Lead[]; quotes?: Quote[] }) {
  const [selectedLead, setSelectedLead] = useState<Lead>(leads[0] ?? mockLeads[0]);
  const [generated, setGenerated] = useState<string>("");

  const queue = useMemo(() => leads.filter((lead) => shouldShow(lead, quotes)), [leads, quotes]);

  function generateMessage(lead: Lead, channel: "whatsapp" | "email") {
    setSelectedLead(lead);
    setGenerated(channel === "whatsapp" ? generateWhatsAppScript("quote-follow-up", lead) : generateEmailScript(lead));
  }

  const counts = {
    notContacted: queue.filter((lead) => !lead.lastContactedAt).length,
    dueToday: queue.filter((lead) => lead.nextFollowUpDate === today).length,
    overdue: queue.filter((lead) => new Date(lead.nextFollowUpDate) < new Date(today)).length,
    pendingQuotes: queue.filter((lead) => quotes.some((quote) => quote.leadId === lead.id && ["Sent", "Viewed", "Follow-Up Due"].includes(quote.status))).length,
    dormant: queue.filter((lead) => lead.isCustomer && daysSince(lead.lastContactedAt) > 90).length,
    birthdays: queue.filter((lead) => month(lead.birthday) === month(today)).length
  };

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading
          eyebrow="Money Execution Layer"
          title="Follow-Up Queue"
          description="Daily sales actions ordered around who needs contact now, who has money pending, and who can be revived."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {Object.entries(counts).map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">{label.replace(/([A-Z])/g, " $1")}</p>
              <p className="mt-3 text-3xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.14em] text-mercury">
                <tr>
                  {["Lead", "Phone", "Service", "Status", "Last contacted", "Next follow-up", "Value", "Reason", "Suggested action", "Quick actions"].map((header) => (
                    <th key={header} className="px-4 py-3 font-bold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {queue.map((lead) => (
                  <tr key={lead.id} className="bg-obsidian/35 align-top text-slate-200">
                    <td className="px-4 py-4"><p className="font-black text-white">{lead.name}</p><p className="mt-1 text-xs text-mercury">{lead.businessName}</p></td>
                    <td className="px-4 py-4">{lead.phone}</td>
                    <td className="px-4 py-4">{lead.serviceInterestedIn}</td>
                    <td className="px-4 py-4"><span className="rounded-lg bg-aurum/10 px-2.5 py-1 text-xs font-bold text-aurum">{lead.status}</span></td>
                    <td className="px-4 py-4">{formatDate(lead.lastContactedAt)}</td>
                    <td className="px-4 py-4">{formatDate(lead.nextFollowUpDate)}</td>
                    <td className="px-4 py-4 font-bold">{currency(lead.dealValue)}</td>
                    <td className="px-4 py-4 text-mercury">{getFollowUpReason(lead, quotes)}</td>
                    <td className="px-4 py-4 text-mercury">{suggestedAction(lead)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian" onClick={() => generateMessage(lead, "whatsapp")}><MessageCircle size={14} className="inline" /> WhatsApp</button>
                        <ActionButton action="create-email-draft" leadId={lead.id} trigger={emailTriggerForFollowUp(lead, getFollowUpReason(lead, quotes))} contextType="follow-up" className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" title="Create email draft"><Mail size={14} className="inline" /> Email Draft</ActionButton>
                        <ActionButton action="mark-contacted" leadId={lead.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><CheckCircle2 size={14} className="inline" /> Mark Contacted</ActionButton>
                        <button className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><MoveRight size={14} className="inline" /> Stage</button>
                        <a className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/quotes/new?leadId=${lead.id}`}><FilePlus2 size={14} className="inline" /> Quote</a>
                      </div>
                    </td>
                  </tr>
                ))}
              {queue.length === 0 ? <tr><td colSpan={10} className="px-4 py-8 text-center text-mercury">No follow-ups due. New intake leads, quote follow-ups, payment reminders, and mockup follow-ups will appear here when they need action.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-5">
          <WhatsAppScriptGenerator lead={selectedLead} />
          <Panel>
            <p className="text-sm font-black text-white">Generated message</p>
            <p className="mt-3 whitespace-pre-line rounded-lg border border-white/10 bg-obsidian/70 p-4 text-sm leading-6 text-slate-200">
              {generated || "Use a quick action to generate a WhatsApp or email follow-up."}
            </p>
            {generated ? <WhatsAppAction className="mt-4" phone={selectedLead.phone} message={generated} /> : null}
          </Panel>
        </div>
      </div>
    </div>
  );
}







