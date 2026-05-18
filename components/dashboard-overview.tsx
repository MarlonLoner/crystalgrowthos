import { CalendarCheck2, Clock3, FileText, Send, Trophy, UsersRound, WalletCards } from "lucide-react";
import { Lead, quotes, quoteFinalTotal, today } from "@/lib/mock-data";
import { currency } from "@/lib/utils";

export function DashboardOverview({ leads }: { leads: Lead[] }) {
  const now = new Date(today);
  const dueToday = leads.filter((lead) => lead.nextFollowUpDate === today).length;
  const overdue = leads.filter((lead) => new Date(lead.nextFollowUpDate) < now).length;
  const sentQuotes = quotes.filter((quote) => ["Sent", "Viewed", "Follow-Up Due"].includes(quote.status));
  const pendingValue = sentQuotes.reduce((total, quote) => total + quoteFinalTotal(quote), 0);
  const won = leads.filter((lead) => lead.status === "Won").length;
  const dormant = leads.filter((lead) => lead.isCustomer && lead.lastContactedAt && Math.floor((now.getTime() - new Date(lead.lastContactedAt).getTime()) / 86400000) > 90).length;

  const cards = [
    ["Total leads", leads.length.toString(), UsersRound],
    ["Follow-ups due today", dueToday.toString(), CalendarCheck2],
    ["Overdue follow-ups", overdue.toString(), Clock3],
    ["Quotes sent", sentQuotes.length.toString(), Send],
    ["Quote value pending", currency(pendingValue), WalletCards],
    ["Deals won", won.toString(), Trophy],
    ["Dormant customers", dormant.toString(), UsersRound],
    ["Quote builder", quotes.length.toString(), FileText]
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, Icon]) => (
        <article
          key={label}
          className="rounded-lg border border-white/10 bg-white/[0.045] p-4 transition hover:border-aurum/40 hover:bg-white/[0.065]"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-mercury">{label}</span>
            <span className="grid size-9 place-items-center rounded-lg bg-aurum/10 text-aurum">
              <Icon size={18} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-black text-white">{value}</p>
        </article>
      ))}
    </div>
  );
}
