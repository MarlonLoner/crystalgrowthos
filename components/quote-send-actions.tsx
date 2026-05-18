"use client";

import { CalendarPlus, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { Lead, Quote, quoteFinalTotal } from "@/lib/mock-data";
import { currency } from "@/lib/utils";
import { WhatsAppAction } from "@/components/whatsapp-action";

export function QuoteSendActions({ quote, lead }: { quote: Quote; lead: Lead }) {
  const [status, setStatus] = useState(quote.status);
  const [followUp, setFollowUp] = useState<string | null>(null);
  const message = useMemo(
    () =>
      `Hi ${lead.name.split(" ")[0]}, your ${quote.serviceCategory.toLowerCase()} quote for ${quote.businessName} is ready. Quote ${quote.quoteNumber} totals ${currency(quoteFinalTotal(quote))}. Please check it and let me know if we can proceed with deposit so we secure production time.`,
    [lead.name, quote]
  );

  function markSent() {
    setStatus("Sent");
  }

  function setTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFollowUp(tomorrow.toISOString().slice(0, 10));
  }

  return (
    <div className="mt-8 rounded-lg border border-orange-200 bg-orange-50 p-5 print:hidden">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-700">Quote Send Flow</p>
          <p className="mt-2 text-lg font-black text-slate-950">Send quote by WhatsApp</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{message}</p>
          <p className="mt-3 text-xs font-bold text-slate-600">Current mock status: {status}{followUp ? ` • Follow-up set for ${followUp}` : ""}</p>
        </div>
        <WhatsAppAction phone={lead.phone} message={message} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={markSent} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white"><Send size={14} /> Mark Quote Sent</button>
        <button type="button" onClick={setTomorrow} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-950"><CalendarPlus size={14} /> Set Follow-up for Tomorrow</button>
      </div>
    </div>
  );
}

