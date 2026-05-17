import { CalendarCheck2, MailCheck, Send, Target, Trophy, UsersRound, WalletCards } from "lucide-react";
import { Lead } from "@/lib/mock-data";
import { currency } from "@/lib/utils";

export function DashboardOverview({ leads }: { leads: Lead[] }) {
  const newThisMonth = leads.filter((lead) => lead.createdAt.startsWith("2026-05")).length;
  const quotesSent = leads.filter((lead) => lead.status === "Quote Sent").length;
  const won = leads.filter((lead) => lead.status === "Won").length;
  const followUps = leads.filter((lead) => new Date(lead.nextFollowUpDate) <= new Date("2026-05-20")).length;
  const pipeline = leads
    .filter((lead) => lead.status !== "Won" && lead.status !== "Lost")
    .reduce((total, lead) => total + lead.dealValue, 0);

  const cards = [
    ["Total leads", leads.length.toString(), UsersRound],
    ["New leads this month", newThisMonth.toString(), Target],
    ["Quotes sent", quotesSent.toString(), Send],
    ["Deals won", won.toString(), Trophy],
    ["Follow-ups due", followUps.toString(), CalendarCheck2],
    ["Scheduled posts", "18", MailCheck],
    ["Email campaigns", "7", MailCheck],
    ["Estimated pipeline", currency(pipeline), WalletCards]
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
