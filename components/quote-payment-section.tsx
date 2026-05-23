import { recordPaymentAction } from "@/lib/actions";
import { PaymentView, ActivityView } from "@/lib/db-data";
import { Quote } from "@/lib/mock-data";
import { getPaymentSummary } from "@/lib/payment-intelligence";
import { currency, formatDate } from "@/lib/utils";
import { inputClass } from "@/components/ui";

const methods = ["USD_CASH", "ECOCASH", "BANK_TRANSFER", "SWIPE", "CASH", "OTHER"];

export function QuotePaymentSection({ quote, payments = [] }: { quote: Quote; payments?: PaymentView[]; activities?: ActivityView[] }) {
  const summary = getPaymentSummary(quote, payments);

  return (
    <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-slate-950 print:hidden">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Payments</p>
      <div className="mt-3 grid gap-3 md:grid-cols-5">
        {[
          ["Quote total", currency(summary.quoteTotal)],
          ["Deposit required", currency(summary.depositRequiredAmount)],
          ["Amount paid", currency(summary.amountPaid)],
          ["Balance", currency(summary.balanceRemaining)],
          ["Status", summary.paymentStatus.replaceAll("_", " ")]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-emerald-200 bg-white p-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-2 font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm font-bold text-emerald-800">Suggested next action: {summary.suggestedNextAction}</p>

      <div className="mt-5 overflow-x-auto rounded-lg border border-emerald-200 bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-emerald-50 text-xs uppercase tracking-[0.14em] text-slate-500"><tr><th className="px-3 py-2">Date</th><th>Amount</th><th>Method</th><th>Reference</th><th>Notes</th></tr></thead>
          <tbody className="divide-y divide-slate-200">
            {payments.map((payment) => <tr key={payment.id}><td className="px-3 py-3">{formatDate(payment.paidAt)}</td><td className="font-bold">{currency(payment.amount)}</td><td>{payment.method.replaceAll("_", " ")}</td><td>{payment.reference || "-"}</td><td>{payment.notes || "-"}</td></tr>)}
            {payments.length === 0 ? <tr><td colSpan={5} className="px-3 py-5 text-center text-slate-500">No payments recorded yet.</td></tr> : null}
          </tbody>
        </table>
      </div>

      <form action={recordPaymentAction} className="mt-5 grid gap-3 md:grid-cols-5">
        <input type="hidden" name="quoteId" value={quote.id} />
        <label className="text-sm font-bold text-slate-700">Amount<input required name="amount" type="number" min="0.01" step="0.01" className={`${inputClass} mt-2 bg-white text-slate-950`} /></label>
        <label className="text-sm font-bold text-slate-700">Method<select name="method" className={`${inputClass} mt-2 bg-white text-slate-950`}>{methods.map((method) => <option key={method} value={method}>{method.replaceAll("_", " ")}</option>)}</select></label>
        <label className="text-sm font-bold text-slate-700">Reference<input name="reference" className={`${inputClass} mt-2 bg-white text-slate-950`} /></label>
        <label className="text-sm font-bold text-slate-700">Paid at<input name="paidAt" type="date" className={`${inputClass} mt-2 bg-white text-slate-950`} /></label>
        <label className="text-sm font-bold text-slate-700">Notes<input name="notes" className={`${inputClass} mt-2 bg-white text-slate-950`} /></label>
        <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-3 text-sm font-black text-white md:col-span-5">Record Payment</button>
      </form>
    </div>
  );
}