"use client";

import { WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { buttonClass, inputClass, Panel, SectionHeading } from "@/components/ui";

const fields = ["platform", "offer", "audience", "service", "tone", "CTA", "pain point"] as const;

export function ContentEngine() {
  const [brief, setBrief] = useState({
    platform: "Facebook",
    offer: "Free logo setup on orders over R10,000",
    audience: "Small business owners",
    service: "Branded apparel",
    tone: "Premium but friendly",
    CTA: "Book a brand consult",
    "pain point": "They look inconsistent across staff and events"
  });
  const [generated, setGenerated] = useState(false);

  const output = useMemo(() => {
    const base = `${brief.audience} deserve ${brief.service.toLowerCase()} that feels consistent, premium, and easy to order.`;
    return {
      "Facebook caption": `${base} This week, Crystal Branding Studio is offering ${brief.offer.toLowerCase()}. ${brief.CTA}.`,
      "Instagram caption": `Your brand should be remembered before anyone reads the business card. ${brief.service} built for ${brief.audience.toLowerCase()}. ${brief.CTA}.`,
      "X post": `${brief.service} should solve this: ${brief["pain point"].toLowerCase()}. Crystal can help. ${brief.CTA}.`,
      "Reel hook": `POV: your team stops looking mismatched and starts looking unmistakably premium.`,
      "WhatsApp caption": `Hi, we are helping ${brief.audience.toLowerCase()} with ${brief.service.toLowerCase()}. Current offer: ${brief.offer}. Reply to ${brief.CTA.toLowerCase()}.`,
      "Ad copy": `${brief.tone} campaign for ${brief.audience.toLowerCase()}: turn ${brief["pain point"].toLowerCase()} into a polished brand experience with ${brief.service.toLowerCase()}.`
    };
  }, [brief]);

  return (
    <Panel id="content">
      <SectionHeading
        eyebrow="Content Engine"
        title="AI-ready marketing copy generator"
        description="Enter campaign context once and generate structured placeholder outputs for every high-use Crystal channel."
      />
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            setGenerated(true);
          }}
        >
          {fields.map((field) => (
            <label key={field} className="text-sm font-bold text-slate-200">
              <span className="capitalize">{field}</span>
              <input
                className={`${inputClass} mt-2`}
                value={brief[field]}
                onChange={(event) => setBrief((current) => ({ ...current, [field]: event.target.value }))}
              />
            </label>
          ))}
          <button className={`${buttonClass} sm:col-span-2`} type="submit">
            <WandSparkles size={18} />
            Generate Placeholder AI Output
          </button>
        </form>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(output).map(([label, text]) => (
            <article key={label} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-aurum">{label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                {generated ? text : "Generate a brief to preview this channel output."}
              </p>
            </article>
          ))}
        </div>
      </div>
    </Panel>
  );
}
