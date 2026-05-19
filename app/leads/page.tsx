import { DashboardShell } from "@/components/dashboard-shell";
import { LeadList } from "@/components/lead-list";
import { getLeadsPageData } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const data = await getLeadsPageData();

  return (
    <DashboardShell>
      {data.source === "fallback" ? (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-200">
          Using demo fallback data. Database leads will appear here when PostgreSQL is reachable.
        </div>
      ) : (
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200">
          Database leads loaded
        </div>
      )}
      <LeadList leads={data.leads} />
    </DashboardShell>
  );
}
