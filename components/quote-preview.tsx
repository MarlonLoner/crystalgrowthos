import Link from "next/link";
import { Download, ExternalLink, Printer } from "lucide-react";
import { Lead, Quote, quoteFinalTotal, quoteSubtotal } from "@/lib/mock-data";
import { currency, formatDate } from "@/lib/utils";
import { buttonClass, Panel } from "@/components/ui";
import { QuoteSendActions } from "@/components/quote-send-actions";
import { QuotePaymentSection } from "@/components/quote-payment-section";
import { CopyPublicQuoteLink } from "@/components/copy-public-quote-link";
import type { CommunicationView, PaymentView, ProductionJobView } from "@/lib/db-data";
import { getProductionSummary } from "@/lib/production-intelligence";

export function QuotePreview({ quote, lead, payments = [], productionJob = null, communications = [] }: { quote: Quote; lead?: Lead; payments?: PaymentView[]; productionJob?: ProductionJobView | null; communications?: CommunicationView[] }) {
  const productionSummary = productionJob ? getProductionSummary(productionJob, quote, payments) : null;

  return (
    <Panel className="bg-white text-slate-950">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-600">Crystal Branding Studio</p>
          <h1 className="mt-2 text-4xl font-black">Quote</h1>
          <p className="mt-2 text-slate-600">Internal quote controls, payment tracking, and branded print/public quote access.</p>
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
      <QuotePaymentSection quote={quote} payments={payments} />

      {communications.length ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 print:hidden">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Quote Communications</p>
          <div className="mt-3 space-y-2">
            {communications.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <p className="font-black text-slate-950">{item.trigger.replaceAll("_", " ")} - {item.channel}</p>
                  <span className="text-xs font-black text-orange-700">{item.status}</span>
                </div>
                <p className="mt-2 line-clamp-2">{item.subject || item.body}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {productionJob && productionSummary ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Production Status</p>
              <p className="mt-2 text-lg font-black text-slate-950">{productionSummary.statusLabel}</p>
              <p className="mt-1 text-sm text-slate-600">{productionSummary.suggestedNextAction}</p>
            </div>
            <Link href="/production" className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white print:hidden">Open Production</Link>
          </div>
        </div>
      ) : null}
      <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 print:hidden">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Branded Quotation</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">Open the Crystal-branded quote for browser print, Save as PDF, or sharing through the public quote link.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-black text-white" href={`/quotes/${quote.id}/print`}><Printer size={16} /> Open Branded Quote</Link>
          <Link className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white" href={`/quotes/${quote.id}/print`}><Download size={16} /> Print / Save PDF</Link>
          <Link className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-black text-slate-950 ring-1 ring-slate-200" href={`/q/${encodeURIComponent(quote.quoteNumber)}`}><ExternalLink size={16} /> Public Quote Link</Link>
          <CopyPublicQuoteLink quoteNumber={quote.quoteNumber} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-black text-slate-950 ring-1 ring-slate-200" />
          <Link className={buttonClass} href={`/quotes/${quote.id}/edit`}>Edit Quote</Link>
          <Link className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white" href="/quotes">Back to Quotes</Link>
        </div>
      </div>
    </Panel>
  );
}









