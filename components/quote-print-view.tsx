import Link from "next/link";
import { CopyPublicQuoteLink } from "@/components/copy-public-quote-link";
import { CrystalLogo } from "@/components/crystal-logo";
import { PrintQuoteButton } from "@/components/print-quote-button";
import { Lead, Quote, quoteFinalTotal, quoteSubtotal } from "@/lib/mock-data";
import type { PaymentView } from "@/lib/db-data";
import { crystalBrand } from "@/lib/crystal-brand";
import { getPaymentSummary } from "@/lib/payment-intelligence";
import { currency, formatDate } from "@/lib/utils";

function displayStatus(status: string) {
  return status.replaceAll("_", " ");
}

function firstName(value?: string | null) {
  return value?.trim().split(/\s+/)[0] || "there";
}

export function QuotePrintView({ quote, lead, payments = [], internal = false }: { quote: Quote; lead?: Lead; payments?: PaymentView[]; internal?: boolean }) {
  const paymentSummary = getPaymentSummary(quote, payments);
  const subtotal = quoteSubtotal(quote);
  const finalTotal = quoteFinalTotal(quote);
  const validLineItems = quote.lineItems.filter((item) => item.description?.trim() && Number(item.quantity) > 0);
  const publicQuotePath = `/q/${encodeURIComponent(quote.quoteNumber)}`;
  const whatsappMessage = `Hi Crystal Branding Studio, I confirm I have received quotation ${quote.quoteNumber} for ${quote.businessName}.`;
  const whatsappUrl = `https://wa.me/263776617821?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="min-h-screen bg-[#f3f5f8] px-4 py-6 text-slate-950 print:bg-white print:px-0 print:py-0">
      <style>{`
        @page { size: A4; margin: 14mm; }
        @media print {
          .quote-document { box-shadow: none !important; border: 0 !important; }
          .quote-print-table thead { display: table-header-group; }
          .quote-print-table tr { break-inside: avoid; page-break-inside: avoid; }
          .quote-section { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <div className="mx-auto mb-4 flex max-w-5xl flex-wrap gap-3 print:hidden">
        <PrintQuoteButton label="Print / Save PDF" />
        {internal ? <Link href={`/quotes/${quote.id}`} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-900">Back to Quote</Link> : null}
        {internal ? <Link href={publicQuotePath} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-900">Public Quote Link</Link> : null}
        {internal ? <CopyPublicQuoteLink quoteNumber={quote.quoteNumber} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-900" /> : null}
      </div>

      <article className="quote-document mx-auto max-w-5xl bg-white px-6 py-8 shadow-xl ring-1 ring-slate-200 sm:px-10 print:max-w-none print:p-0 print:shadow-none print:ring-0">
        <header className="quote-section text-center">
          <CrystalLogo className="print:max-w-[360px]" />
          <h1 className="mt-5 text-3xl font-black uppercase tracking-[0.1em] text-[#174c9f] sm:text-4xl">{crystalBrand.businessName}</h1>
          <p className="mt-1 text-sm font-black uppercase tracking-[0.18em] text-[#c51f27]">{crystalBrand.tagline}</p>

          <div className="mt-7 grid gap-4 border-y-2 border-slate-300 py-4 text-left text-sm sm:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Business Address</p>
              <p className="mt-2 font-semibold text-slate-800">{crystalBrand.addressLine1}</p>
              <p className="font-semibold text-slate-800">{crystalBrand.addressLine2}</p>
              <p className="font-semibold text-slate-800">{crystalBrand.city}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Quotation Reference</p>
              <p className="mt-2 text-lg font-black text-slate-950">{quote.quoteNumber}</p>
              <p className="mt-2 text-slate-700">Tel / WhatsApp: {crystalBrand.phoneNumbers.join(" / ")}</p>
              <p className="text-slate-700">Email: {crystalBrand.emails.join(" / ")}</p>
              <p className="text-slate-700">Website: {crystalBrand.website}</p>
            </div>
          </div>
        </header>

        <section className="quote-section mt-7 text-center">
          <div className="inline-flex items-center justify-center border-b-4 border-[#c51f27] px-8 pb-2">
            <h2 className="text-3xl font-black uppercase tracking-[0.18em] text-[#174c9f]">Quotation</h2>
          </div>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">Status: <span className="text-[#c51f27]">{displayStatus(quote.status)}</span></p>
        </section>

        <section className="quote-section mt-7 rounded-xl border border-slate-300 bg-slate-50 p-4">
          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Client name</p><p className="mt-1 font-black text-slate-950">{quote.clientName}</p></div>
            <div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Business name</p><p className="mt-1 font-black text-slate-950">{quote.businessName}</p></div>
            <div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Service category</p><p className="mt-1 font-black text-slate-950">{quote.serviceCategory}</p></div>
            <div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Quote date</p><p className="mt-1 font-semibold text-slate-800">{formatDate(quote.createdAt)}</p></div>
            <div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Expiry date</p><p className="mt-1 font-semibold text-slate-800">{formatDate(quote.expiryDate)}</p></div>
            <div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Prepared by</p><p className="mt-1 font-semibold text-slate-800">Crystal Team</p></div>
            {lead?.phone ? <div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Client phone</p><p className="mt-1 font-semibold text-slate-800">{lead.phone}</p></div> : null}
            {lead?.email ? <div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Client email</p><p className="mt-1 font-semibold text-slate-800">{lead.email}</p></div> : null}
          </div>
        </section>

        <section className="mt-7 overflow-x-auto">
          <table className="quote-print-table w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-200 text-xs uppercase tracking-[0.12em] text-slate-700">
                <th className="w-20 border border-slate-300 px-3 py-3 text-center">Qty</th>
                <th className="border border-slate-300 px-3 py-3">Description</th>
                <th className="w-36 border border-slate-300 px-3 py-3 text-right">Unit Price</th>
                <th className="w-36 border border-slate-300 px-3 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {validLineItems.length ? validLineItems.map((item) => (
                <tr key={item.id}>
                  <td className="border border-slate-300 px-3 py-3 text-center font-semibold">{item.quantity}</td>
                  <td className="border border-slate-300 px-3 py-3 font-semibold leading-6 text-slate-800">{item.description}</td>
                  <td className="border border-slate-300 px-3 py-3 text-right">{currency(item.unitPrice)}</td>
                  <td className="border border-slate-300 px-3 py-3 text-right font-bold">{currency(item.quantity * item.unitPrice)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="border border-slate-300 px-3 py-6 text-center text-slate-500">No line items have been added to this quotation.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="quote-section mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-xl border border-slate-300 p-4 text-sm leading-6 text-slate-700">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#174c9f]">Terms and Payment Details</p>
            <div className="mt-3 space-y-2">
              <p>{quote.terms || `Deposit required before production begins. Quote valid until ${formatDate(quote.expiryDate)}.`}</p>
              <p>{paymentSummary.depositPercentage}% deposit is required to begin production. Balance is due before installation, delivery, or collection unless otherwise agreed in writing.</p>
              <p>Client acceptance: reply by WhatsApp/email with the quotation number and deposit confirmation.</p>
              {quote.notes ? <p className="whitespace-pre-line"><span className="font-black text-slate-950">Notes:</span> {quote.notes}</p> : null}
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">{currency(subtotal)}</span></div>
            {Number(quote.discount) > 0 ? <div className="flex justify-between"><span>Discount</span><span className="font-bold">-{currency(quote.discount)}</span></div> : null}
            <div className="flex justify-between"><span>Deposit required ({paymentSummary.depositPercentage}%)</span><span className="font-bold">{currency(paymentSummary.depositRequiredAmount)}</span></div>
            {internal ? <div className="flex justify-between"><span>Amount paid</span><span className="font-bold">{currency(paymentSummary.amountPaid)}</span></div> : null}
            {internal ? <div className="flex justify-between"><span>Balance remaining</span><span className="font-bold">{currency(paymentSummary.balanceRemaining)}</span></div> : null}
            <div className="mt-3 flex justify-between border-t-2 border-slate-400 pt-3 text-2xl font-black text-[#174c9f]"><span>Total</span><span>{currency(finalTotal)}</span></div>
          </div>
        </section>

        {!internal ? (
          <section className="quote-section mt-6 rounded-xl border border-[#174c9f]/20 bg-[#174c9f]/5 p-4 text-sm text-slate-700 print:hidden">
            <p className="font-black text-slate-950">Ready to proceed?</p>
            <p className="mt-1">Hi {firstName(lead?.name || quote.clientName)}, reply to Crystal Branding Studio with quote {quote.quoteNumber} to confirm acceptance or request changes.</p>
            <a href={whatsappUrl} className="mt-3 inline-flex rounded-lg bg-[#174c9f] px-4 py-2.5 text-sm font-black text-white">Confirm on WhatsApp</a>
          </section>
        ) : null}

        <section className="quote-section mt-10 grid gap-8 text-sm sm:grid-cols-3">
          <div>
            <div className="border-b border-slate-500 pb-8" />
            <p className="mt-2 font-black">Prepared by / Authorized Signature</p>
          </div>
          <div>
            <div className="border-b border-slate-500 pb-8" />
            <p className="mt-2 font-black">Client Acceptance Signature</p>
          </div>
          <div>
            <div className="border-b border-slate-500 pb-8" />
            <p className="mt-2 font-black">Date</p>
          </div>
        </section>

        <footer className="quote-section mt-8 border-t-2 border-slate-300 pt-5 text-center text-sm text-slate-700">
          <p className="font-black text-slate-950">Thank you for choosing {crystalBrand.businessName}.</p>
          <p className="mt-1">{crystalBrand.phoneNumbers.join(" / ")} | {crystalBrand.emails.join(" / ")} | {crystalBrand.website}</p>
        </footer>
      </article>
    </main>
  );
}

