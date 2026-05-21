import { DashboardShell } from "@/components/dashboard-shell";
import { QuoteForm } from "@/components/quote-form";
import { getQuoteCreateData } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function NewQuotePage({ searchParams }: { searchParams: Promise<{ leadId?: string; lead?: string }> }) {
  const params = await searchParams;
  const leadId = params.leadId ?? params.lead ?? null;
  const data = await getQuoteCreateData(leadId);

  return (
    <DashboardShell>
      <QuoteForm
        mode="create"
        leads={data.leads}
        initialValues={data.initialQuote}
        selectedLead={data.selectedLead}
        assets={data.assets}
        activities={data.activities}
        source={data.source}
      />
    </DashboardShell>
  );
}