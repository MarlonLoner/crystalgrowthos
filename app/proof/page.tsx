import { DashboardShell } from "@/components/dashboard-shell";
import { ProofBoard } from "@/components/proof-board";
import { getProofBoardData } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function ProofPage() {
  const data = await getProofBoardData();

  return (
    <DashboardShell>
      <ProofBoard items={data.items} source={data.source} />
    </DashboardShell>
  );
}
