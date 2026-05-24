import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { QuotePreview } from "@/components/quote-preview";
import { getQuoteDetailForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getQuoteDetailForPage(id);

  if (!data) notFound();

  const isDatabaseQuote = data.source === "database";

  return (
    <DashboardShell>
      <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-300">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <span className={isDatabaseQuote ? "text-emerald-300" : "text-amber-300"}>
            {isDatabaseQuote ? "Database quote loaded" : "Using demo fallback data. Changes will not persist."}
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400">
            <span>Database status: {data.quote.status}</span>
            <span>Quote ID: {data.quote.id}</span>
            <span>Quote Number: {data.quote.quoteNumber}</span>
          </div>
        </div>
      </div>
      <QuotePreview quote={data.quote} lead={data.lead} payments={data.payments} productionJob={data.productionJob} />
    </DashboardShell>
  );
}

