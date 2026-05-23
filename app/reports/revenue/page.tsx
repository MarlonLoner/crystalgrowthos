import { DashboardShell } from "@/components/dashboard-shell";
import { RevenueReport } from "@/components/revenue-report";
import { getRevenueSourceData } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function RevenueReportPage() {
  const data = await getRevenueSourceData();

  return (
    <DashboardShell>
      <RevenueReport leads={data.leads} quotes={data.quotes} activities={data.activities} payments={data.payments} />
    </DashboardShell>
  );
}
