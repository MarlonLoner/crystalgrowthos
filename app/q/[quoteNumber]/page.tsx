import { notFound } from "next/navigation";
import { QuotePrintView } from "@/components/quote-print-view";
import { getQuoteDetailForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function PublicQuotePage({ params }: { params: Promise<{ quoteNumber: string }> }) {
  const { quoteNumber } = await params;
  const data = await getQuoteDetailForPage(decodeURIComponent(quoteNumber));

  if (!data) notFound();

  return <QuotePrintView quote={data.quote} lead={data.lead} payments={data.payments} />;
}