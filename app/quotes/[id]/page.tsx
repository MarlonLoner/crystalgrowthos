import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { QuotePreview } from "@/components/quote-preview";
import { leads, quotes } from "@/lib/mock-data";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = quotes.find((item) => item.id === id);

  if (!quote) notFound();

  const lead = leads.find((item) => item.id === quote.leadId);

  return (
    <DashboardShell>
      <QuotePreview quote={quote} lead={lead} />
    </DashboardShell>
  );
}

