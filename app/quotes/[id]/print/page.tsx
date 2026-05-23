import { notFound } from "next/navigation";
import { QuotePrintView } from "@/components/quote-print-view";
import { getQuoteDetailForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function QuotePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getQuoteDetailForPage(id);

  if (!data) notFound();

  return <QuotePrintView quote={data.quote} lead={data.lead} internal />;
}