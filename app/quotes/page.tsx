import { DashboardShell } from "@/components/dashboard-shell";
import { QuoteList } from "@/components/quote-list";
import { getQuotesForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const quotes = await getQuotesForPage();

  return (
    <DashboardShell>
      <QuoteList quotes={quotes} />
    </DashboardShell>
  );
}
