import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { Quote, quoteFinalTotal } from "@/lib/mock-data";
import { currency, formatDate } from "@/lib/utils";
import { buttonClass, Panel, SectionHeading } from "@/components/ui";

export function QuoteList({ quotes }: { quotes: Quote[] }) {
  return (
    <Panel>
      <SectionHeading
        eyebrow="Quote Builder"
        title="Quotes that need movement"
        description="Track quote value, status, expiry, and the next money action from one sales-ready table."
      />
      <div className="mb-4 flex justify-end">
        <Link href="/quotes/new" className={buttonClass}><Plus size={18} /> Create Quote</Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.14em] text-mercury">
            <tr>{["Quote", "Client", "Service", "Status", "Final total", "Created", "Expires", "Actions"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {quotes.map((quote) => (
              <tr key={quote.id} className="bg-obsidian/35 text-slate-200">
                <td className="px-4 py-4"><p className="font-black text-white">{quote.quoteNumber}</p><p className="mt-1 text-xs text-mercury">{quote.businessName}</p></td>
                <td className="px-4 py-4">{quote.clientName}</td>
                <td className="px-4 py-4">{quote.serviceCategory}</td>
                <td className="px-4 py-4"><span className="rounded-lg bg-aurum/10 px-2.5 py-1 text-xs font-bold text-aurum">{quote.status}</span></td>
                <td className="px-4 py-4 font-black text-white">{currency(quoteFinalTotal(quote))}</td>
                <td className="px-4 py-4">{formatDate(quote.createdAt)}</td>
                <td className="px-4 py-4">{formatDate(quote.expiryDate)}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <Link className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian" href={`/quotes/${quote.id}`}><FileText size={14} className="inline" /> Preview</Link>
                    <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/quotes/${quote.id}/edit`}>Edit</Link>
                  </div>
                </td>
              </tr>
            ))}
          {quotes.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-mercury">No quotes yet. Create one from a warm lead or from a mockup-ready shopfront request.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}


