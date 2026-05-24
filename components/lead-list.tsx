import { Edit, Eye, FilePlus2, Plus } from "lucide-react";
import Link from "next/link";
import type { LeadStage } from "@/lib/mock-data";

import { generateWhatsAppScript } from "@/lib/scripts";
import { currency, formatDate } from "@/lib/utils";
import { WhatsAppAction } from "@/components/whatsapp-action";
import { buttonClass, Panel, SectionHeading } from "@/components/ui";

export type LeadListItem = {
  id: string;
  name: string;
  phone: string;
  businessName: string;
  businessType: string;
  source: string;
  serviceInterestedIn: string;
  status: LeadStage;
  dealValue: number;
  estimatedDealValue: number;
  birthday: string;
  notes: string;
  createdAt: string;
  lastContactedAt: string | null;
  nextFollowUpDate: string;
  isCustomer?: boolean;
};

type LeadListProps = {
  leads?: LeadListItem[];
};

export function LeadList({ leads = [] }: LeadListProps) {
  return (
    <Panel>
      <SectionHeading
        eyebrow="Lead Management"
        title="Lead command center"
        description="Capture, inspect, and action every branding opportunity before money leaks from the pipeline."
      />
      <div className="mb-4 flex justify-end">
        <Link href="/leads/new" className={buttonClass}><Plus size={18} /> Add Lead</Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-[1120px] w-full text-left text-sm">
          <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.14em] text-mercury">
            <tr>{["Name", "Phone", "Business", "Service", "Source", "Status", "Estimated value", "Next follow-up", "Quick actions"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {leads.map((lead) => {
              const message = generateWhatsAppScript(!lead.lastContactedAt ? "first-response" : "quote-follow-up", lead);
              return (
                <tr key={lead.id} className="bg-obsidian/35 align-top text-slate-200">
                  <td className="px-4 py-4 font-black text-white">{lead.name}</td>
                  <td className="px-4 py-4">{lead.phone}</td>
                  <td className="px-4 py-4"><p className="font-bold text-white">{lead.businessName}</p><p className="mt-1 text-xs text-mercury">{lead.businessType}</p></td>
                  <td className="px-4 py-4">{lead.serviceInterestedIn}</td>
                  <td className="px-4 py-4">{lead.source}</td>
                  <td className="px-4 py-4"><span className="rounded-lg bg-aurum/10 px-2.5 py-1 text-xs font-bold text-aurum">{lead.status}</span></td>
                  <td className="px-4 py-4 font-bold">{currency(lead.estimatedDealValue)}</td>
                  <td className="px-4 py-4">{formatDate(lead.nextFollowUpDate)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian" href={`/leads/${lead.id}`}><Eye size={14} className="inline" /> View</Link>
                      <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/leads/${lead.id}/edit`}><Edit size={14} className="inline" /> Edit</Link>
                      <Link className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white" href={`/quotes/new?leadId=${lead.id}`}><FilePlus2 size={14} className="inline" /> Quote</Link>
                      <WhatsAppAction phone={lead.phone} message={message} />
                    </div>
                  </td>
                </tr>
              );
            })}
          {leads.length === 0 ? <tr><td colSpan={9} className="px-4 py-8 text-center text-mercury">No leads yet. Add a lead manually or share the public intake forms to start capturing opportunities.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}





