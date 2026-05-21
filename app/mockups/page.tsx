import { DashboardShell } from "@/components/dashboard-shell";
import { MockupsBoard } from "@/components/mockups-board";
import { getMockupBoardData } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function MockupsPage() {
  const data = await getMockupBoardData();

  return (
    <DashboardShell>
      <MockupsBoard leads={data.leads} assets={data.assets} activities={data.activities} quotes={data.quotes} source={data.source} />
    </DashboardShell>
  );
}