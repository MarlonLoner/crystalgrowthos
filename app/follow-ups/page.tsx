import { DashboardShell } from "@/components/dashboard-shell";
import { FollowUpQueue } from "@/components/follow-up-queue";
import { getRevenueSourceData } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function FollowUpsPage() {
  const data = await getRevenueSourceData();

  return (
    <DashboardShell>
      <FollowUpQueue leads={data.leads} quotes={data.quotes} />
    </DashboardShell>
  );
}
