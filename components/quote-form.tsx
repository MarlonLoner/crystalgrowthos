import { Save } from "lucide-react";
import { leads, Quote, quotes } from "@/lib/mock-data";
import { buttonClass, inputClass, Panel, SectionHeading } from "@/components/ui";

export function QuoteForm({ mode, quote }: { mode: "create" | "edit"; quote?: Quote }) {
  const fallback = quote ?? quotes[0];

  return (
    <Panel>
      <SectionHeading
        eyebrow={mode === "create" ? "Create Quote" : "Edit Quote"}
        title={mode === "create" ? "Build a quote that moves to deposit" : `Update ${fallback.quoteNumber}`}
        description="MVP form structure for quote capture. Persistence can be wired to Prisma actions/API routes next."
      />
      <form className="grid gap-4 lg:grid-cols-2">
        <label className="text-sm font-bold text-slate-200">Client / lead
          <select className={`${inputClass} mt-2`} defaultValue={fallback.leadId}>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name} - {lead.businessName}</option>)}</select>
        </label>
        <label className="text-sm font-bold text-slate-200">Quote number
          <input className={`${inputClass} mt-2`} defaultValue={mode === "create" ? "CBS-2026-006" : fallback.quoteNumber} />
        </label>
        <label className="text-sm font-bold text-slate-200">Business name
          <input className={`${inputClass} mt-2`} defaultValue={fallback.businessName} />
        </label>
        <label className="text-sm font-bold text-slate-200">Service category
          <input className={`${inputClass} mt-2`} defaultValue={fallback.serviceCategory} />
        </label>
        <label className="text-sm font-bold text-slate-200">Status
          <select className={`${inputClass} mt-2`} defaultValue={fallback.status}>{["Draft", "Sent", "Viewed", "Follow-Up Due", "Accepted", "Rejected", "Paid"].map((status) => <option key={status}>{status}</option>)}</select>
        </label>
        <label className="text-sm font-bold text-slate-200">Expiry date
          <input className={`${inputClass} mt-2`} type="date" defaultValue={fallback.expiryDate} />
        </label>
        <div className="lg:col-span-2 rounded-lg border border-white/10 bg-obsidian/60 p-4">
          <p className="mb-3 text-sm font-black text-white">Line items</p>
          <div className="grid gap-3 lg:grid-cols-[1fr_8rem_10rem]">
            {(mode === "create" ? [{ id: "new-1", description: "Shopfront branding package", quantity: 1, unitPrice: 950 }] : fallback.lineItems).map((item) => (
              <div key={item.id} className="contents">
                <input className={inputClass} defaultValue={item.description} />
                <input className={inputClass} type="number" defaultValue={item.quantity} />
                <input className={inputClass} type="number" defaultValue={item.unitPrice} />
              </div>
            ))}
          </div>
        </div>
        <label className="text-sm font-bold text-slate-200">Discount
          <input className={`${inputClass} mt-2`} type="number" defaultValue={fallback.discount} />
        </label>
        <label className="text-sm font-bold text-slate-200">Terms
          <input className={`${inputClass} mt-2`} defaultValue={fallback.terms} />
        </label>
        <label className="lg:col-span-2 text-sm font-bold text-slate-200">Notes
          <textarea className={`${inputClass} mt-2 min-h-28`} defaultValue={fallback.notes} />
        </label>
        <button className={`${buttonClass} lg:col-span-2`} type="button"><Save size={18} /> Save Quote Draft</button>
      </form>
    </Panel>
  );
}
