import { DashboardShell } from "@/components/dashboard-shell";
import { FollowUpQueue } from "@/components/follow-up-queue";

export default function FollowUpsPage() {
  return (
    <DashboardShell>
      <FollowUpQueue />
    </DashboardShell>
  );
}
