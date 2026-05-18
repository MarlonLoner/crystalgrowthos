import { DashboardShell } from "@/components/dashboard-shell";
import { LeadForm } from "@/components/lead-form";

export default function NewLeadPage() {
  return (
    <DashboardShell>
      <LeadForm mode="create" />
    </DashboardShell>
  );
}

