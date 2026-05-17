import { Bot, Sparkles } from "lucide-react";
import { Panel, SectionHeading } from "@/components/ui";

const recommendations = [
  "Prioritize Cobalt Tech with a launch-merch proposal by Tuesday; it is the highest-value open opportunity.",
  "Send quote follow-ups to Northstar Fitness and Apex Legal Africa today, using proof-focused messaging.",
  "Create a retail re-engagement email around reusable bag bundles for buyers whose budgets reopen in Q3."
];

export function StrategyAssistant() {
  return (
    <Panel id="strategy">
      <SectionHeading
        eyebrow="AI Strategy Assistant"
        title="Recommendations for the next best moves"
        description="Mock insights shaped like an OpenAI-powered advisor so the component can later connect to live business data."
      />
      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          {recommendations.map((item, index) => (
            <div key={item} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
              <div className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ember/15 text-aurum">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-200">{item}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-aurum/20 bg-aurum/10 p-5">
          <Bot className="text-aurum" size={28} />
          <p className="mt-4 text-lg font-black text-white">OpenAI-ready architecture</p>
          <p className="mt-2 text-sm leading-6 text-mercury">
            The integration placeholder lives in <span className="font-semibold text-white">lib/openai.ts</span>.
            Connect it to aggregated leads, campaigns, and reports when production data rules are final.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-obsidian/70 px-3 py-2 text-xs font-bold text-aurum">
            <Sparkles size={14} />
            Mock mode active
          </div>
        </div>
      </div>
    </Panel>
  );
}
