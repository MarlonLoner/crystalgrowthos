"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { campaigns as seedCampaigns } from "@/lib/mock-data";
import { buttonClass, inputClass, Panel, SectionHeading } from "@/components/ui";

const templates = [
  "Welcome sequence",
  "Story-based sales email",
  "Offer email",
  "Objection handling email",
  "Re-engagement email",
  "Holiday email",
  "Birthday email"
];

export function EmailCampaignEngine() {
  const [campaigns, setCampaigns] = useState(seedCampaigns);
  const [form, setForm] = useState({
    title: "June Brand Revival",
    template: "Re-engagement email",
    audience: "Dormant customers",
    subject: "Your next brand moment is waiting",
    body: "A concise draft that invites inactive customers back with a premium seasonal offer."
  });

  async function saveDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }).catch(() => null);
    const data = response ? await response.json() : null;

    setCampaigns((current) => [
      {
        id: data?.campaign?.id ?? crypto.randomUUID(),
        title: form.title,
        template: form.template,
        audience: form.audience,
        subject: form.subject,
        status: "Draft"
      },
      ...current
    ]);
  }

  return (
    <Panel id="campaigns">
      <SectionHeading
        eyebrow="Email Campaign Engine"
        title="Template-based campaigns saved as drafts"
        description="Create email campaigns with the core Crystal sales templates and persist them through the API when PostgreSQL is connected."
      />
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <form className="space-y-3" onSubmit={saveDraft}>
          <label className="block text-sm font-bold text-slate-200">
            Campaign title
            <input className={`${inputClass} mt-2`} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </label>
          <label className="block text-sm font-bold text-slate-200">
            Template
            <select className={`${inputClass} mt-2`} value={form.template} onChange={(event) => setForm({ ...form, template: event.target.value })}>
              {templates.map((template) => (
                <option key={template}>{template}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-slate-200">
            Audience
            <input className={`${inputClass} mt-2`} value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })} />
          </label>
          <label className="block text-sm font-bold text-slate-200">
            Subject
            <input className={`${inputClass} mt-2`} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} />
          </label>
          <label className="block text-sm font-bold text-slate-200">
            Body
            <textarea className={`${inputClass} mt-2 min-h-32 resize-y`} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} />
          </label>
          <button className={buttonClass} type="submit">
            <Save size={18} />
            Save Draft
          </button>
        </form>
        <div className="grid gap-3 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{campaign.title}</p>
                  <p className="mt-1 text-xs text-mercury">{campaign.template}</p>
                </div>
                <span className="rounded-lg border border-aurum/20 bg-aurum/10 px-2.5 py-1 text-xs font-bold text-aurum">
                  {campaign.status}
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-200">{campaign.subject}</p>
              <p className="mt-2 text-xs leading-5 text-mercury">{campaign.audience}</p>
            </article>
          ))}
        </div>
      </div>
    </Panel>
  );
}
