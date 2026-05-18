import { DashboardShell } from "@/components/dashboard-shell";
import { QuoteForm } from "@/components/quote-form";

export default function NewQuotePage() {
  return (
    <DashboardShell>
      <QuoteForm mode="create" />
    </DashboardShell>
  );
}
