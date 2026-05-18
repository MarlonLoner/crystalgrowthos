import { DashboardShell } from "@/components/dashboard-shell";
import { QuoteList } from "@/components/quote-list";

export default function QuotesPage() {
  return (
    <DashboardShell>
      <QuoteList />
    </DashboardShell>
  );
}
