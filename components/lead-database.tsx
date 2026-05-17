"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Lead } from "@/lib/mock-data";
import { currency, formatDate } from "@/lib/utils";
import { inputClass, Panel, SectionHeading } from "@/components/ui";

export function LeadDatabase({ initialLeads }: { initialLeads: Lead[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return initialLeads.filter((lead) =>
      [lead.name, lead.businessName, lead.businessType, lead.source, lead.serviceInterestedIn, lead.status]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [initialLeads, query]);

  return (
    <Panel id="leads">
      <SectionHeading
        eyebrow="Lead Database"
        title="Lead records with follow-up intelligence"
        description="Searchable CRM-style table covering contact info, interest, source, deal value, birthdays, notes, and next action dates."
      />
      <div className="relative mb-4 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          className={`${inputClass} pl-10`}
          placeholder="Search leads, services, sources, or statuses"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.14em] text-mercury">
            <tr>
              {["Lead", "Contact", "Business", "Source", "Service", "Status", "Value", "Birthday", "Next follow-up", "Notes"].map((header) => (
                <th key={header} className="px-4 py-3 font-bold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map((lead) => (
              <tr key={lead.id} className="bg-obsidian/35 align-top text-slate-200">
                <td className="px-4 py-4 font-bold text-white">{lead.name}</td>
                <td className="px-4 py-4">
                  <p>{lead.phone}</p>
                  <p className="mt-1 text-xs text-mercury">{lead.email}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold">{lead.businessName}</p>
                  <p className="mt-1 text-xs text-mercury">{lead.businessType}</p>
                </td>
                <td className="px-4 py-4">{lead.source}</td>
                <td className="px-4 py-4">{lead.serviceInterestedIn}</td>
                <td className="px-4 py-4">
                  <span className="rounded-lg border border-aurum/20 bg-aurum/10 px-2.5 py-1 text-xs font-bold text-aurum">
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-4 font-bold">{currency(lead.dealValue)}</td>
                <td className="px-4 py-4">{formatDate(lead.birthday)}</td>
                <td className="px-4 py-4">{formatDate(lead.nextFollowUpDate)}</td>
                <td className="px-4 py-4 text-mercury">{lead.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
