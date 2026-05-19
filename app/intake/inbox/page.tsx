import Link from "next/link";
import { ReceiptText, UsersRound } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { Panel, SectionHeading, buttonClass } from "@/components/ui";
import { getIntakeInboxData } from "@/lib/db-data";
import { currency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function messageFor(lead: { name: string; businessName: string; serviceInterestedIn: string; urgency: string }) {
  return `Hi ${lead.name.split(" ")[0]}, thanks for sending your branding request for ${lead.businessName}. I saw you are interested in ${lead.serviceInterestedIn}. Can you send any photos, measurements, or logo files so we can guide you properly?`;
}

export default async function IntakeInboxPage() {
  const data = await getIntakeInboxData();

  return (
    <DashboardShell>
      <section>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-aurum">Website Capture</p>
            <h1 className="mt-1 text-3xl font-black text-white">Intake Inbox</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-mercury">New website and shopfront mockup leads that need fast first response.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/intake" className="rounded-lg border border-white/10 px-3 py-2 text-xs font-black text-white hover:bg-white/10">Public Intake</Link>
            <Link href="/intake/shopfront" className={buttonClass}>Shopfront Form</Link>
          </div>
        </div>

        {data.source === "fallback" ? (
          <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-200">Using demo fallback data. Database intake leads will appear here when PostgreSQL is reachable.</div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <Panel><p className="text-xs font-bold uppercase tracking-[0.16em] text-mercury">Website leads</p><p className="mt-2 text-3xl font-black text-white">{data.newWebsiteLeads.length}</p></Panel>
          <Panel><p className="text-xs font-bold uppercase tracking-[0.16em] text-mercury">Mockup requests</p><p className="mt-2 text-3xl font-black text-white">{data.shopfrontRequests.length}</p></Panel>
          <Panel><p className="text-xs font-bold uppercase tracking-[0.16em] text-mercury">Not contacted</p><p className="mt-2 text-3xl font-black text-white">{data.uncontactedLeads.length}</p></Panel>
          <Panel><p className="text-xs font-bold uppercase tracking-[0.16em] text-mercury">High urgency</p><p className="mt-2 text-3xl font-black text-white">{data.highUrgencyLeads.length}</p></Panel>
        </div>
      </section>

      <Panel>
        <SectionHeading eyebrow="Response Queue" title="New intake opportunities" description="Prioritize the leads that came from public capture forms and have not been contacted yet." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-mercury">
              <tr>
                <th className="py-3">Lead</th>
                <th>Service</th>
                <th>Source</th>
                <th>Urgency</th>
                <th>Created</th>
                <th>Value</th>
                <th>Next action</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.items.map((lead) => (
                <tr key={lead.id} className="align-top">
                  <td className="py-4"><p className="font-black text-white">{lead.name}</p><p className="text-xs text-mercury">{lead.businessName}</p><p className="text-xs text-slate-500">{lead.phone}</p></td>
                  <td className="py-4 text-slate-200">{lead.serviceInterestedIn}</td>
                  <td className="py-4 text-slate-300">{lead.source}</td>
                  <td className="py-4"><span className={lead.isHighUrgency ? "rounded-lg bg-red-500/15 px-2 py-1 text-xs font-black text-red-200" : "rounded-lg bg-white/10 px-2 py-1 text-xs font-black text-slate-200"}>{lead.urgency}</span></td>
                  <td className="py-4 text-slate-300">{formatDate(lead.createdAt)}</td>
                  <td className="py-4 font-black text-aurum">{currency(lead.estimatedDealValue)}</td>
                  <td className="py-4 max-w-xs text-slate-300">{lead.suggestedNextAction}</td>
                  <td className="py-4">
                    <div className="flex min-w-64 flex-col gap-2">
                      <WhatsAppAction phone={lead.phone} message={messageFor(lead)} />
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/leads/${lead.id}`} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-black text-white hover:bg-white/10"><UsersRound size={14} /> View Lead</Link>
                        <Link href={`/quotes/new?leadId=${lead.id}`} className="inline-flex items-center gap-2 rounded-lg border border-aurum/25 bg-aurum/10 px-3 py-2 text-xs font-black text-aurum hover:bg-aurum/15"><ReceiptText size={14} /> Create Quote</Link>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-mercury">No intake leads yet. Share the public intake form to start capturing opportunities.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>
    </DashboardShell>
  );
}


