import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { LeadForm } from "@/components/lead-form";
import { getLeadDetailForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getLeadDetailForPage(id);

  if (!data) notFound();

  return (
    <DashboardShell>
      <LeadForm mode="edit" lead={data.lead} />
    </DashboardShell>
  );
}
