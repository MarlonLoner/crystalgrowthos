"use client";

import { ArrowRightLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Lead, LeadStage, stages } from "@/lib/mock-data";
import { currency } from "@/lib/utils";
import { Panel, SectionHeading } from "@/components/ui";

export function SalesPipeline({ initialLeads }: { initialLeads: Lead[] }) {
  const [pipelineLeads, setPipelineLeads] = useState(initialLeads);

  const grouped = useMemo(
    () =>
      stages.map((stage) => ({
        stage,
        leads: pipelineLeads.filter((lead) => lead.status === stage)
      })),
    [pipelineLeads]
  );

  async function moveLead(id: string, stage: LeadStage) {
    setPipelineLeads((current) =>
      current.map((lead) => (lead.id === id ? { ...lead, status: stage } : lead))
    );

    await fetch(`/api/leads/${id}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage })
    }).catch(() => null);
  }

  return (
    <Panel id="pipeline">
      <SectionHeading
        eyebrow="Sales Pipeline"
        title="Move opportunities through every deal stage"
        description="Each lead can be advanced or recovered across the full Crystal sales workflow from new lead to won or lost."
      />
      <div className="grid gap-3 xl:grid-cols-4">
        {grouped.map(({ stage, leads }) => (
          <div key={stage} className="min-h-52 rounded-lg border border-white/10 bg-obsidian/50 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-white">{stage}</h3>
              <span className="rounded-lg bg-white/8 px-2 py-1 text-xs font-bold text-mercury">
                {leads.length}
              </span>
            </div>
            <div className="space-y-3">
              {leads.map((lead) => (
                <article key={lead.id} className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{lead.businessName}</p>
                      <p className="mt-1 text-xs text-mercury">{lead.name}</p>
                    </div>
                    <p className="text-sm font-black text-aurum">{currency(lead.dealValue)}</p>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-mercury">{lead.serviceInterestedIn}</p>
                  <label className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-300">
                    <ArrowRightLeft size={14} className="text-aurum" />
                    <select
                      value={lead.status}
                      onChange={(event) => moveLead(lead.id, event.target.value as LeadStage)}
                      className="w-full rounded-lg border border-white/10 bg-obsidian px-2 py-2 text-xs text-white outline-none focus:border-aurum"
                    >
                      {stages.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
