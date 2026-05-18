import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { LeadForm } from "@/components/lead-form";
import { leads } from "@/lib/mock-data";

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = leads.find((item) => item.id === id);

  if (!lead) notFound();

  return (
    <DashboardShell>
      <LeadForm mode="edit" lead={lead} />
    </DashboardShell>
  );
}

