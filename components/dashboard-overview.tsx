import { CalendarCheck2, Flame, Send, Target, Trophy, UsersRound, WalletCards } from "lucide-react";
import { Lead } from "@/lib/mock-data";
import { getRevenueMetrics } from "@/lib/revenue-intelligence";
import { currency } from "@/lib/utils";

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function DashboardOverview({ leads }: { leads: Lead[] }) {
  const metrics = getRevenueMetrics();
  const needingContact = leads.filter((lead) => !lead.lastContactedAt || new Date(lead.nextFollowUpDate) <= new Date("2026-05-18")).length;

  const cards = [
    ["Total leads", metrics.totalLeads.toString(), UsersRound, "/leads"],
    ["New leads this week", "5", UsersRound, "/leads/new"],
    ["Hot leads", "5", Flame, "/money-today"],
    ["Leads needing contact", needingContact.toString(), CalendarCheck2, "/money-today"],
    ["Pending quote value", currency(metrics.pendingQuoteValue), WalletCards, "/money-today"],
    ["Average quote value", currency(metrics.averageQuoteValue), Target, "/reports/revenue"],
    ["Quote acceptance rate", percent(metrics.quoteAcceptanceRate), Trophy, "/reports/revenue"],
    ["Lead-to-quote rate", percent(metrics.leadToQuoteRate), Send, "/reports/revenue"]
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, Icon, href]) => (
        <a
          key={label}
          href={href}
          className="rounded-lg border border-white/10 bg-white/[0.045] p-4 transition hover:border-aurum/40 hover:bg-white/[0.065]"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-mercury">{label}</span>
            <span className="grid size-9 place-items-center rounded-lg bg-aurum/10 text-aurum">
              <Icon size={18} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-black text-white">{value}</p>
        </a>
      ))}
    </div>
  );
}
