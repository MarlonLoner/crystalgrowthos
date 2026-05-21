import { Save } from "lucide-react";
import Link from "next/link";
import { createQuoteAction } from "@/lib/actions";
import { ActivityView, LeadAssetView } from "@/lib/db-data";
import { Lead, Quote, quotes } from "@/lib/mock-data";
import { SuggestedQuoteLineItem } from "@/lib/quote-suggestions";
import { buttonClass, inputClass, Panel, SectionHeading } from "@/components/ui";

export type QuoteInitialValues = {
  leadId: string;
  clientName: string;
  businessName: string;
  quoteNumber: string;
  serviceCategory: string;
  notes: string;
  terms: string;
  discount: number;
  expiryDate: string;
  lineItems: SuggestedQuoteLineItem[];
};

function fallbackInitial(quote?: Quote, quoteNumber = "CBS-2026-001"): QuoteInitialValues {
  const fallback = quote ?? quotes[0];
  return {
    leadId: fallback.leadId,
    clientName: fallback.clientName,
    businessName: fallback.businessName,
    quoteNumber: quote ? fallback.quoteNumber : quoteNumber,
    serviceCategory: fallback.serviceCategory,
    notes: fallback.notes,
    terms: fallback.terms,
    discount: fallback.discount,
    expiryDate: fallback.expiryDate,
    lineItems: quote ? fallback.lineItems : [{ description: "Shopfront branding package", quantity: 1, unitPrice: 950 }]
  };
}

export function QuoteForm({
  mode,
  quote,
  leads = [],
  initialValues,
  selectedLead,
  assets = [],
  activities = [],
  source = "database"
}: {
  mode: "create" | "edit";
  quote?: Quote;
  leads?: Lead[];
  initialValues?: QuoteInitialValues | null;
  selectedLead?: Lead | null;
  assets?: LeadAssetView[];
  activities?: ActivityView[];
  source?: "database" | "fallback";
}) {
  const fallback = initialValues ?? fallbackInitial(quote);
  const shopfrontImages = assets.filter((asset) => asset.type === "SHOPFRONT_IMAGE").length;
  const logos = assets.filter((asset) => asset.type === "LOGO").length;
  const references = assets.filter((asset) => asset.type === "REFERENCE_IMAGE").length;
  const latestMockupActivity = activities.find((activity) => /mockup|ready for quote/i.test(`${activity.title} ${activity.note}`));

  return (
    <div className="space-y-5">
      {selectedLead ? (
        <Panel className="border-aurum/20 bg-aurum/10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-aurum">Quote From Lead</p>
              <h1 className="mt-1 text-2xl font-black text-white">Creating quote from lead: {selectedLead.businessName}</h1>
              <p className="mt-2 text-sm text-slate-200">Source: {selectedLead.source} | Service: {selectedLead.serviceInterestedIn} | Assets: {assets.length}</p>
            </div>
            <Link href={`/leads/${selectedLead.id}`} className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/15">Back to lead</Link>
          </div>
        </Panel>
      ) : null}

      <Panel>
        <SectionHeading
          eyebrow={mode === "create" ? "Create Quote" : "Edit Quote"}
          title={mode === "create" ? "Build a quote that moves to deposit" : `Update ${fallback.quoteNumber}`}
          description={selectedLead ? "Lead details, mockup notes, and suggested line items are prefilled from the database." : "Create a quote linked to a lead and save it to the database."}
        />
        {source === "fallback" ? <p className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-200">Using fallback data. Database lead prefill is unavailable.</p> : null}

        {selectedLead ? (
          <div className="mb-4 rounded-lg border border-white/10 bg-obsidian/60 p-4">
            <p className="text-sm font-black text-white">Lead assets available</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-white/[0.04] p-3"><p className="text-xs text-mercury">Shopfront images</p><p className="font-black text-white">{shopfrontImages}</p></div>
              <div className="rounded-lg bg-white/[0.04] p-3"><p className="text-xs text-mercury">Logos</p><p className="font-black text-white">{logos}</p></div>
              <div className="rounded-lg bg-white/[0.04] p-3"><p className="text-xs text-mercury">References</p><p className="font-black text-white">{references}</p></div>
              <div className="rounded-lg bg-white/[0.04] p-3"><p className="text-xs text-mercury">Latest mockup</p><p className="font-black text-white">{latestMockupActivity?.title ?? "None"}</p></div>
            </div>
            <p className="mt-3 text-sm text-mercury">Check the lead asset gallery and mockup notes before final pricing.</p>
          </div>
        ) : null}

        <form action={mode === "create" ? createQuoteAction : undefined} className="grid gap-4 lg:grid-cols-2">
          <label className="text-sm font-bold text-slate-200">Client / lead
            <select name="leadId" className={`${inputClass} mt-2`} defaultValue={fallback.leadId}>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name} - {lead.businessName}</option>)}</select>
          </label>
          <label className="text-sm font-bold text-slate-200">Client name
            <input name="clientName" className={`${inputClass} mt-2`} defaultValue={fallback.clientName} />
          </label>
          <label className="text-sm font-bold text-slate-200">Quote number
            <input name="quoteNumber" className={`${inputClass} mt-2`} defaultValue={fallback.quoteNumber} />
          </label>
          <label className="text-sm font-bold text-slate-200">Business name
            <input name="businessName" className={`${inputClass} mt-2`} defaultValue={fallback.businessName} />
          </label>
          <label className="text-sm font-bold text-slate-200">Service category
            <input name="serviceCategory" className={`${inputClass} mt-2`} defaultValue={fallback.serviceCategory} />
          </label>
          <label className="text-sm font-bold text-slate-200">Status
            <select name="status" className={`${inputClass} mt-2`} defaultValue={mode === "create" ? "Draft" : quote?.status ?? "Draft"}>{["Draft", "Sent", "Viewed", "Follow-Up Due", "Accepted", "Rejected", "Paid"].map((status) => <option key={status}>{status}</option>)}</select>
          </label>
          <label className="text-sm font-bold text-slate-200">Expiry date
            <input name="expiryDate" className={`${inputClass} mt-2`} type="date" defaultValue={fallback.expiryDate} />
          </label>
          <div className="lg:col-span-2 rounded-lg border border-white/10 bg-obsidian/60 p-4">
            <p className="mb-3 text-sm font-black text-white">Suggested line items</p>
            <div className="grid gap-3 lg:grid-cols-[1fr_8rem_10rem]">
              {fallback.lineItems.map((item, index) => (
                <div key={`${item.description}-${index}`} className="contents">
                  <input name="lineDescription" className={inputClass} defaultValue={item.description} />
                  <input name="lineQuantity" className={inputClass} type="number" min="1" defaultValue={item.quantity} />
                  <input name="lineUnitPrice" className={inputClass} type="number" min="0" step="0.01" defaultValue={item.unitPrice} />
                </div>
              ))}
            </div>
          </div>
          <label className="text-sm font-bold text-slate-200">Discount
            <input name="discount" className={`${inputClass} mt-2`} type="number" min="0" step="0.01" defaultValue={fallback.discount} />
          </label>
          <label className="text-sm font-bold text-slate-200">Terms
            <input name="terms" className={`${inputClass} mt-2`} defaultValue={fallback.terms} />
          </label>
          <label className="lg:col-span-2 text-sm font-bold text-slate-200">Notes
            <textarea name="notes" className={`${inputClass} mt-2 min-h-36`} defaultValue={fallback.notes} />
          </label>
          <button className={`${buttonClass} lg:col-span-2`} type={mode === "create" ? "submit" : "button"}><Save size={18} /> {mode === "create" ? "Save Quote" : "Save Quote Draft"}</button>
        </form>
      </Panel>
    </div>
  );
}