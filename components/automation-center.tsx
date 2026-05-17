"use client";

import { Power } from "lucide-react";
import { useState } from "react";
import { automationRules } from "@/lib/mock-data";
import { Panel, SectionHeading } from "@/components/ui";

export function AutomationCenter() {
  const [rules, setRules] = useState(
    automationRules.map(([name, description, enabled]) => ({ name, description, enabled }))
  );

  async function toggleRule(name: string) {
    const next = rules.map((rule) =>
      rule.name === name ? { ...rule, enabled: !rule.enabled } : rule
    );
    setRules(next);
    const enabled = next.find((rule) => rule.name === name)?.enabled ?? false;

    await fetch(`/api/automations/${encodeURIComponent(name)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled })
    }).catch(() => null);
  }

  return (
    <Panel id="automation">
      <SectionHeading
        eyebrow="Automation Center"
        title="Rules for repeatable customer journeys"
        description="Toggle birthday wishes, holidays, follow-ups, reviews, referrals, and inactive customer revival workflows."
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rules.map((rule) => (
          <article key={rule.name} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-black text-white">{rule.name}</p>
                <p className="mt-2 text-sm leading-6 text-mercury">{rule.description}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleRule(rule.name)}
                className={`grid size-11 shrink-0 place-items-center rounded-lg border transition ${
                  rule.enabled
                    ? "border-aurum/40 bg-aurum/15 text-aurum"
                    : "border-white/10 bg-white/5 text-slate-500"
                }`}
                aria-label={`Toggle ${rule.name}`}
              >
                <Power size={18} />
              </button>
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-mercury">
              {rule.enabled ? "Enabled" : "Disabled"}
            </p>
          </article>
        ))}
      </div>
    </Panel>
  );
}
