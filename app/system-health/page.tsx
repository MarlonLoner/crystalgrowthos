import Link from "next/link";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Panel, SectionHeading } from "@/components/ui";
import { getRevenueSourceData } from "@/lib/db-data";
import { getDataHealthWarnings } from "@/lib/data-health";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const severityClass = {
  info: "border-sky-300/25 bg-sky-400/10 text-sky-100",
  warning: "border-aurum/30 bg-aurum/10 text-aurum",
  critical: "border-red-300/25 bg-red-500/10 text-red-100"
} as const;

const severityIcon = {
  info: Info,
  warning: AlertTriangle,
  critical: XCircle
} as const;

export default async function SystemHealthPage() {
  const data = await getRevenueSourceData();
  const warnings = getDataHealthWarnings(data);
  let databaseOk = data.source === "database";
  const counts = {
    leads: data.leads.length,
    quotes: data.quotes.length,
    payments: data.payments.length,
    productionJobs: data.productionJobs.length,
    proofAssets: data.proofAssets.length,
    contentPosts: data.contentPosts.length
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseOk = true;
  } catch {
    databaseOk = false;
  }

  const debugLinks = [
    ["Production debug", "/api/debug/production"],
    ["Proof debug", "/api/debug/proof"],
    ["Proof sync", "/api/debug/proof/sync"],
    ["Content debug", "/api/debug/content"],
    ["Debug route index", "/api/debug"]
  ] as const;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <Panel>
          <SectionHeading
            eyebrow="System Health"
            title="Data confidence and operational checks"
            description="A quick view of database status, core record counts, and gaps that can cause revenue or proof work to fall through the cracks."
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-black ${databaseOk ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100" : "border-red-300/30 bg-red-500/10 text-red-100"}`}>
              {databaseOk ? <CheckCircle2 size={16} /> : <XCircle size={16} />} Database {databaseOk ? "connected" : "unavailable"}
            </span>
            <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-slate-300">Source: {data.source}</span>
          </div>
        </Panel>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {Object.entries(counts).map(([label, value]) => (
            <Panel key={label}>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">{label.replace(/([A-Z])/g, " $1")}</p>
              <p className="mt-3 text-3xl font-black text-white">{value}</p>
            </Panel>
          ))}
        </div>

        <Panel>
          <SectionHeading eyebrow="Data Health" title={`${warnings.length} checks to review`} description="Warnings point to records that may need a next action, production handoff, payment follow-up, proof creation, or content scheduling." />
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {warnings.map((warning) => {
              const Icon = severityIcon[warning.severity];
              return (
                <Link key={`${warning.title}-${warning.link}`} href={warning.link} className={`rounded-lg border p-4 transition hover:border-white/30 ${severityClass[warning.severity]}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2"><Icon size={18} /><p className="font-black">{warning.title}</p></div>
                    <span className="rounded-lg bg-obsidian/40 px-2 py-1 text-xs font-black">{warning.count}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 opacity-90">{warning.message}</p>
                </Link>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <SectionHeading eyebrow="Debug Routes" title="MVP diagnostics" description="These routes help verify database state while building. Protect or remove them before broader production use." />
          <div className="mt-4 flex flex-wrap gap-2">
            {debugLinks.map(([label, href]) => <Link key={href} href={href} className="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold text-white">{label}</Link>)}
          </div>
          <p className="mt-4 text-sm leading-6 text-mercury">Payment debug routes require a quote id, for example `/api/debug/payments/[quoteId]`. Use a real quote id from `/quotes` or `/api/debug/quote/quote-1`.</p>
        </Panel>
      </div>
    </DashboardShell>
  );
}
