import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentSummary } from "@/lib/payment-intelligence";
import { quoteFinalTotal } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ quoteId: string }> }) {
  try {
    const { quoteId } = await params;
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { lineItems: true, payments: { orderBy: { paidAt: "desc" } }, lead: { include: { activities: { orderBy: { createdAt: "desc" } } } } }
    });

    if (!quote) return NextResponse.json({ ok: false, error: `Quote not found: ${quoteId}` }, { status: 404 });

    const viewQuote = {
      ...quote,
      discount: Number(quote.discount),
      lineItems: quote.lineItems.map((item) => ({ ...item, unitPrice: Number(item.unitPrice) }))
    };
    const payments = quote.payments.map((payment) => ({
      id: payment.id,
      quoteId: payment.quoteId,
      leadId: payment.leadId,
      amount: Number(payment.amount),
      method: payment.method,
      reference: payment.reference ?? "",
      notes: payment.notes ?? "",
      paidAt: payment.paidAt.toISOString().slice(0, 10),
      createdAt: payment.createdAt.toISOString().slice(0, 10)
    }));

    return NextResponse.json({
      ok: true,
      quote,
      lead: quote.lead,
      payments,
      paymentSummary: getPaymentSummary(viewQuote as any, payments),
      relatedActivities: quote.lead.activities.filter((activity) => /payment|production|balance/i.test(`${activity.title} ${activity.note ?? ""}`))
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown payments debug error" }, { status: 500 });
  }
}