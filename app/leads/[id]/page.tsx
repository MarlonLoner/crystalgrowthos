import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { LeadDetail } from "@/components/lead-detail";
import { getLeadDetailForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getLeadDetailForPage(id);

  if (!data) notFound();

  return (
    <DashboardShell>
      <LeadDetail lead={data.lead} relatedQuotes={data.quotes} activities={data.activities} assets={data.assets} payments={data.payments} />
    </DashboardShell>
  );
}

