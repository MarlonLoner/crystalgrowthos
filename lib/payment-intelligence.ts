import { Quote, quoteFinalTotal } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";

export type PaymentView = {
  id: string;
  quoteId: string;
  leadId: string | null;
  amount: number;
  method: string;
  reference: string;
  notes: string;
  paidAt: string;
  createdAt: string;
};

export type PaymentStatus = "UNPAID" | "DEPOSIT_PAID" | "PARTIALLY_PAID" | "FULLY_PAID" | "OVERPAID";

export function getPaymentSummary(quote: Pick<Quote, "lineItems" | "discount">, payments: PaymentView[] = [], depositPercentage = 60) {
  const quoteTotal = quoteFinalTotal(quote as Quote);
  const amountPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const balanceRemaining = Math.max(quoteTotal - amountPaid, 0);
  const depositRequiredAmount = quoteTotal * (depositPercentage / 100);

  let paymentStatus: PaymentStatus = "UNPAID";
  if (amountPaid > quoteTotal) paymentStatus = "OVERPAID";
  else if (amountPaid >= quoteTotal && quoteTotal > 0) paymentStatus = "FULLY_PAID";
  else if (amountPaid >= depositRequiredAmount && amountPaid > 0) paymentStatus = "DEPOSIT_PAID";
  else if (amountPaid > 0) paymentStatus = "PARTIALLY_PAID";

  const suggestedNextAction = paymentStatus === "UNPAID"
    ? "Request deposit"
    : paymentStatus === "PARTIALLY_PAID"
      ? "Collect remaining deposit"
      : paymentStatus === "DEPOSIT_PAID"
        ? "Begin production and collect balance"
        : paymentStatus === "FULLY_PAID" || paymentStatus === "OVERPAID"
          ? "Mark complete"
          : "Request deposit";

  return {
    quoteTotal,
    amountPaid,
    balanceRemaining,
    depositRequiredAmount,
    depositPercentage,
    paymentStatus,
    suggestedNextAction,
    formatted: {
      quoteTotal: formatCurrency(quoteTotal),
      amountPaid: formatCurrency(amountPaid),
      balanceRemaining: formatCurrency(balanceRemaining),
      depositRequiredAmount: formatCurrency(depositRequiredAmount)
    }
  };
}