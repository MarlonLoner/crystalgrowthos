import { DashboardShell } from "@/components/dashboard-shell";
import { ProductionBoard } from "@/components/production-board";
import { getProductionBoardData } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function ProductionPage() {
  const data = await getProductionBoardData();

  return (
    <DashboardShell>
      <ProductionBoard items={data.jobs} source={data.source} />
    </DashboardShell>
  );
}
