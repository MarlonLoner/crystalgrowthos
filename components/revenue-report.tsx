import Link from "next/link";
import { getRevenueMetrics, RevenueActivity } from "@/lib/revenue-intelligence";
import { Lead, Quote } from "@/lib/mock-data";
import { currency } from "@/lib/utils";
import { Panel, SectionHeading } from "@/components/ui";

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function RevenueReport({ leads, quotes, activities }: { leads: Lead[]; quotes: Quote[]; activities: RevenueActivity[] }) {
  const metrics = getRevenueMetrics(leads, quotes, activities);
  const cards = [
    ["Total leads", metrics.totalLeads.toString()],
    ["New leads this month", metrics.newLeadsThisMonth.toString()],
    ["Quotes created", metrics.quotesCreated.toString()],
    ["Quotes sent", metrics.quotesSent.toString()],
    ["Quotes accepted", metrics.quotesAccepted.toString()],
    ["Quotes rejected", metrics.quotesRejected.toString()],
    ["Quotes paid", metrics.quotesPaid.toString()],
    ["Pending quote value", currency(metrics.pendingQuoteValue)],
    ["Won quote value", currency(metrics.wonRevenueThisMonth)],
    ["Lost quote value", currency(metrics.lostOpportunityValue)],
    ["Average quote value", currency(metrics.averageQuoteValue)],
    ["Lead-to-quote rate", percent(metrics.leadToQuoteRate)],
    ["Quote acceptance rate", percent(metrics.quoteAcceptanceRate)],
    ["Quote-to-win rate", percent(metrics.quoteToWinRate)],
    ["Best lead source", `${metrics.bestLeadSource.name} (${metrics.bestLeadSource.count})`],
    ["Best service category", `${metrics.bestServiceCategory.name} (${metrics.bestServiceCategory.count})`]
  ];

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading
          eyebrow="Revenue Report"
          title="Pipeline quality and money movement"
          description="A clean read on lead volume, quote movement, close rates, source quality, service demand, and top opportunities."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">{label}</p>
              <p className="mt-3 text-2xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionHeading
          eyebrow="Top 5"
          title="Highest-value open opportunities"
          description="The deals most worth chasing before the week gets noisy."
        />
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.14em] text-mercury">
              <tr>{["Lead", "Business", "Service", "Status", "Source", "Value", "Quote", "Action"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {metrics.topOpenOpportunities.map(({ lead, quote, value }) => (
                <tr key={lead.id} className="bg-obsidian/35 text-slate-200">
                  <td className="px-4 py-4 font-black text-white">{lead.name}</td>
                  <td className="px-4 py-4">{lead.businessName}</td>
                  <td className="px-4 py-4">{lead.serviceInterestedIn}</td>
                  <td className="px-4 py-4"><span className="rounded-lg bg-aurum/10 px-2.5 py-1 text-xs font-bold text-aurum">{lead.status}</span></td>
                  <td className="px-4 py-4">{lead.source}</td>
                  <td className="px-4 py-4 font-black text-white">{currency(value)}</td>
                  <td className="px-4 py-4">{quote ? quote.quoteNumber : "No quote"}</td>
                  <td className="px-4 py-4"><Link className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian" href={`/leads/${lead.id}`}>Open Lead</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}


