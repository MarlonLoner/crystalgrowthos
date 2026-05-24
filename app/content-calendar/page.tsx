import { ContentCalendarBoard } from "@/components/content-calendar-board";
import { DashboardShell } from "@/components/dashboard-shell";
import { getContentCalendarData } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function ContentCalendarPage() {
  const data = await getContentCalendarData();

  return (
    <DashboardShell>
      <ContentCalendarBoard items={data.posts} source={data.source} />
    </DashboardShell>
  );
}
