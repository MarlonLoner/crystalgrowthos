import Link from "next/link";
import { Lead, Quote, quoteFinalTotal, quoteSubtotal } from "@/lib/mock-data";
import { currency, formatDate } from "@/lib/utils";
import { buttonClass, Panel } from "@/components/ui";
import { QuoteSendActions } from "@/components/quote-send-actions";

export function QuotePreview({ quote, lead }: { quote: Quote; lead?: Lead }) {
  return (
    <Panel className="bg-white text-slate-950">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-600">Crystal Branding Studio</p>
          <h1 className="mt-2 text-4xl font-black">Quote</h1>
          <p className="mt-2 text-slate-600">Clean PDF-style preview for client sending and future export.</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-2xl font-black">{quote.quoteNumber}</p>
          <p className="mt-2 text-sm text-slate-600">Created {formatDate(quote.createdAt)}</p>
          <p className="text-sm text-slate-600">Expires {formatDate(quote.expiryDate)}</p>
          <span className="mt-3 inline-block rounded-lg bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{quote.status}</span>
        </div>
      </div>

      <div className="grid gap-6 py-6 md:grid-cols-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Prepared for</p>
          <p className="mt-2 text-xl font-black">{quote.clientName}</p>
          <p className="text-slate-600">{quote.businessName}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Service category</p>
          <p className="mt-2 text-xl font-black">{quote.serviceCategory}</p>
        </div>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
          <tr><th className="py-3">Item</th><th>Qty</th><th>Unit</th><th className="text-right">Total</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {quote.lineItems.map((item) => (
            <tr key={item.id}><td className="py-4 font-semibold">{item.description}</td><td>{item.quantity}</td><td>{currency(item.unitPrice)}</td><td className="text-right font-bold">{currency(item.quantity * item.unitPrice)}</td></tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto mt-6 max-w-sm space-y-2 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{currency(quoteSubtotal(quote))}</span></div>
        <div className="flex justify-between"><span>Discount</span><span>{currency(quote.discount)}</span></div>
        <div className="flex justify-between border-t border-slate-200 pt-3 text-2xl font-black"><span>Final total</span><span>{currency(quoteFinalTotal(quote))}</span></div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div><p className="font-black">Notes</p><p className="mt-2 text-sm leading-6 text-slate-600">{quote.notes}</p></div>
        <div><p className="font-black">Terms</p><p className="mt-2 text-sm leading-6 text-slate-600">{quote.terms}</p></div>
      </div>

      {lead ? <QuoteSendActions quote={quote} lead={lead} /> : null}

      <div className="mt-8 flex flex-wrap gap-3 print:hidden">
        <Link className={buttonClass} href={`/quotes/${quote.id}/edit`}>Edit Quote</Link>
        <Link className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white" href="/quotes">Back to Quotes</Link>
      </div>
    </Panel>
  );
}

