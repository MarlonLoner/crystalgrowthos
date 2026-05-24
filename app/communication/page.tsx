import { CommunicationQueue } from "@/components/communication-queue";
import { DashboardShell } from "@/components/dashboard-shell";
import { getCommunicationQueueData } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function CommunicationPage() {
  const data = await getCommunicationQueueData();

  return (
    <DashboardShell>
      <CommunicationQueue communications={data.communications} />
    </DashboardShell>
  );
}
