"use client";

import { CalendarPlus, CheckCircle2, Eye, Link as LinkIcon, Send, XCircle } from "lucide-react";
import { useMemo } from "react";
import { ActionButton } from "@/components/action-button";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { Lead, Quote, quoteFinalTotal } from "@/lib/mock-data";
import { currency } from "@/lib/utils";

export function QuoteSendActions({ quote, lead }: { quote: Quote; lead: Lead }) {
  const message = useMemo(
    () =>
      `Hi ${lead.name.split(" ")[0]}, your ${quote.serviceCategory.toLowerCase()} quote for ${quote.businessName} is ready. Quote ${quote.quoteNumber} totals ${currency(quoteFinalTotal(quote))}. Terms/deposit details are included on the quote. You can view or save it here: /quotes/${quote.id}/print. Please confirm if we can proceed with deposit/payment so we secure production time.`,
    [lead.name, quote]
  );

  return (
    <div className="mt-8 rounded-lg border border-orange-200 bg-orange-50 p-5 print:hidden">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-700">Quote Send Flow</p>
          <p className="mt-2 text-lg font-black text-slate-950">Send and update quote status</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{message}</p>
          <p className="mt-3 text-xs font-bold text-slate-600">Current status: {quote.status}</p>
          <a href={`/quotes/${quote.id}/print`} className="mt-3 inline-flex items-center gap-2 text-xs font-black text-orange-700 hover:text-orange-900"><LinkIcon size={14} /> Open printable quote link</a>
        </div>
        <WhatsAppAction phone={lead.phone} message={message} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton action="quote-status" quoteId={quote.id} quoteStatus="SENT" className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white"><Send size={14} /> Mark Quote Sent</ActionButton>
        <ActionButton action="quote-status" quoteId={quote.id} quoteStatus="VIEWED" className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-950"><Eye size={14} /> Mark Viewed</ActionButton>
        <ActionButton action="quote-status" quoteId={quote.id} quoteStatus="ACCEPTED" className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black text-white"><CheckCircle2 size={14} /> Mark Accepted</ActionButton>
        <ActionButton action="quote-status" quoteId={quote.id} quoteStatus="REJECTED" className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-xs font-black text-white"><XCircle size={14} /> Mark Rejected</ActionButton>
        <ActionButton action="quote-status" quoteId={quote.id} quoteStatus="PAID" className="inline-flex items-center gap-2 rounded-lg bg-aurum px-3 py-2 text-xs font-black text-slate-950"><CheckCircle2 size={14} /> Mark Paid</ActionButton>
        <ActionButton action="schedule-quote-follow-up" quoteId={quote.id} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-950"><CalendarPlus size={14} /> Set Follow-up for Tomorrow</ActionButton>
      </div>
    </div>
  );
}

