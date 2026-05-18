import { CalendarCheck2, Flame, Send, Trophy, UsersRound, WalletCards } from "lucide-react";
import { Lead, quotes, quoteFinalTotal, today } from "@/lib/mock-data";
import { currency } from "@/lib/utils";

export function DashboardOverview({ leads }: { leads: Lead[] }) {
  const now = new Date(today);
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const newThisWeek = leads.filter((lead) => new Date(lead.createdAt) >= weekAgo).length;
  const hotLeads = leads.filter((lead) => ["Quote Requested", "Quote Sent", "Follow-Up Needed", "Negotiating"].includes(lead.status)).length;
  const needingContact = leads.filter((lead) => !lead.lastContactedAt || new Date(lead.nextFollowUpDate) <= now).length;
  const sentQuotes = quotes.filter((quote) => ["Sent", "Viewed", "Follow-Up Due"].includes(quote.status));
  const pendingValue = sentQuotes.reduce((total, quote) => total + quoteFinalTotal(quote), 0);
  const won = leads.filter((lead) => lead.status === "Won").length;
  const dueToday = leads.filter((lead) => lead.nextFollowUpDate === today).length;

  const cards = [
    ["Total leads", leads.length.toString(), UsersRound, "/leads"],
    ["New leads this week", newThisWeek.toString(), UsersRound, "/leads/new"],
    ["Hot leads", hotLeads.toString(), Flame, "/leads"],
    ["Leads needing contact", needingContact.toString(), CalendarCheck2, "/follow-ups"],
    ["Pending quote value", currency(pendingValue), WalletCards, "/quotes"],
    ["Quotes sent", sentQuotes.length.toString(), Send, "/quotes"],
    ["Follow-ups due today", dueToday.toString(), CalendarCheck2, "/follow-ups"],
    ["Deals won", won.toString(), Trophy, "/quotes"]
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

