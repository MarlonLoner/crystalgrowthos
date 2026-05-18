import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { QuoteForm } from "@/components/quote-form";
import { quotes } from "@/lib/mock-data";

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = quotes.find((item) => item.id === id);

  if (!quote) notFound();

  return (
    <DashboardShell>
      <QuoteForm mode="edit" quote={quote} />
    </DashboardShell>
  );
}
