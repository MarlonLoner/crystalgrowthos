import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { LeadDetail } from "@/components/lead-detail";
import { leads } from "@/lib/mock-data";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = leads.find((item) => item.id === id);

  if (!lead) notFound();

  return (
    <DashboardShell>
      <LeadDetail lead={lead} />
    </DashboardShell>
  );
}

