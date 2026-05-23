import Link from "next/link";
import { PrintQuoteButton } from "@/components/print-quote-button";
import { Lead, Quote, quoteFinalTotal, quoteSubtotal } from "@/lib/mock-data";
import { currency, formatDate } from "@/lib/utils";

export function QuotePrintView({ quote, lead, internal = false }: { quote: Quote; lead?: Lead; internal?: boolean }) {
  return (
    <main className="min-h-screen bg-white px-6 py-8 text-slate-950 print:px-0 print:py-0">
      <div className="mx-auto max-w-4xl bg-white print:max-w-none">
        <div className="mb-6 flex flex-wrap gap-3 print:hidden">
          <PrintQuoteButton />
          {internal ? <Link href={`/quotes/${quote.id}`} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-black text-slate-900">Back to Quote</Link> : null}
        </div>

        <section className="border-b-4 border-orange-500 pb-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-600">Crystal Branding Studio</p>
              <h1 className="mt-3 text-5xl font-black tracking-tight">Quote</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Professional branding, signage, print, and installation services for businesses ready to stand out.</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-2xl font-black">{quote.quoteNumber}</p>
              <span className="mt-3 inline-block rounded-lg border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-black uppercase text-orange-700">{quote.status}</span>
              <p className="mt-3 text-sm text-slate-600">Quote date: {formatDate(quote.createdAt)}</p>
              <p className="text-sm text-slate-600">Expiry date: {formatDate(quote.expiryDate)}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 border-b border-slate-200 py-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Client name</p>
            <p className="mt-2 text-lg font-black">{quote.clientName}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Business</p>
            <p className="mt-2 text-lg font-black">{quote.businessName}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Service</p>
            <p className="mt-2 text-lg font-black">{quote.serviceCategory}</p>
          </div>
        </section>

        <section className="py-6">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-y border-slate-300 bg-slate-100 text-xs uppercase tracking-[0.14em] text-slate-600">
                <th className="py-3 pl-3">Line item</th>
                <th className="py-3">Qty</th>
                <th className="py-3">Unit price</th>
                <th className="py-3 pr-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quote.lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 pl-3 font-semibold">{item.description}</td>
                  <td className="py-4">{item.quantity}</td>
                  <td className="py-4">{currency(item.unitPrice)}</td>
                  <td className="py-4 pr-3 text-right font-bold">{currency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto mt-6 max-w-sm space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{currency(quoteSubtotal(quote))}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>{currency(quote.discount)}</span></div>
            <div className="flex justify-between border-t border-slate-300 pt-3 text-2xl font-black"><span>Final total</span><span>{currency(quoteFinalTotal(quote))}</span></div>
          </div>
        </section>

        <section className="grid gap-6 border-t border-slate-200 py-6 sm:grid-cols-2">
          <div>
            <p className="font-black">Notes</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{quote.notes || "No additional notes."}</p>
          </div>
          <div>
            <p className="font-black">Terms</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{quote.terms || "Quote valid until expiry date. Deposit required before production."}</p>
          </div>
        </section>

        <footer className="border-t border-slate-300 pt-6 text-sm text-slate-700">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-black text-slate-950">Crystal Branding Studio</p>
              <p>WhatsApp: +263 776 617 821</p>
              {lead ? <p>Prepared for {lead.name} at {lead.businessName}</p> : null}
            </div>
            <p className="font-black text-orange-700">Thank you for choosing Crystal Branding Studio.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}