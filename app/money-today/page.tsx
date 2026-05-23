import { DashboardShell } from "@/components/dashboard-shell";
import { MoneyToday } from "@/components/money-today";
import { getMoneyTodayPageData } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function MoneyTodayPage() {
  const data = await getMoneyTodayPageData();

  return (
    <DashboardShell>
      <MoneyToday leads={data.leads} quotes={data.quotes} activities={data.activities} assets={data.assets} payments={data.payments} />
    </DashboardShell>
  );
}
