import { DashboardShell } from "@/components/dashboard-shell";
import { Panel, SectionHeading } from "@/components/ui";
import { getCommunicationTemplate } from "@/lib/communication-templates";

export const dynamic = "force-dynamic";

const templateTriggers = [
  ["NEW_LEAD", "New lead"],
  ["ASSETS_RECEIVED", "Assets received"],
  ["MISSING_ASSETS", "Missing assets"],
  ["MOCKUP_SENT", "Mockup sent"],
  ["QUOTE_SENT", "Quote sent"],
  ["DEPOSIT_REMINDER", "Deposit reminder"],
  ["PAYMENT_RECEIVED", "Payment received"],
  ["PRODUCTION_STARTED", "Production update"],
  ["INSTALLATION_SCHEDULED", "Installation"],
  ["BALANCE_REMINDER", "Balance reminder"],
  ["JOB_COMPLETED", "Job completed"],
  ["REVIEW_REQUEST", "Review request"],
  ["REFERRAL_REQUEST", "Referral request"],
  ["CONTENT_PERMISSION", "Content permission"]
] as const;

const launchReady = new Set(["NEW_LEAD", "ASSETS_RECEIVED", "MISSING_ASSETS", "QUOTE_SENT", "PAYMENT_RECEIVED"]);
const sampleContext = {
  lead: { name: "Tariro", businessName: "Harare Fresh Foods", serviceInterestedIn: "Shopfront branding", phone: "+263776617821", email: "client@example.com" },
  quote: { quoteNumber: "CBS-2026-001", businessName: "Harare Fresh Foods", serviceCategory: "Shopfront branding", finalTotal: 650 },
  job: { title: "Shopfront signage production", installationDate: new Date() },
  amount: 390,
  balance: 260,
  missingAssets: ["shopfront photo", "logo"]
};

export default function CommunicationTemplatesPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <Panel>
          <SectionHeading eyebrow="Launch Review" title="Communication templates" description="Read-only deterministic templates used by the draft-first communication engine. Review these before enabling live automated sending." />
          <div className="rounded-lg border border-aurum/25 bg-aurum/10 p-4 text-sm leading-6 text-aurum">
            Static launch status is used for now. Templates marked Needs review should be manually checked before disabling EMAIL_TEST_MODE or enabling broader automation.
          </div>
        </Panel>
        <div className="grid gap-4 xl:grid-cols-2">
          {templateTriggers.map(([trigger, label]) => {
            const email = getCommunicationTemplate(trigger, "EMAIL", sampleContext);
            const whatsapp = getCommunicationTemplate(trigger, "WHATSAPP", sampleContext);
            const ready = launchReady.has(trigger);
            return (
              <Panel key={trigger}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">{label}</p>
                    <h2 className="mt-1 text-xl font-black text-white">{trigger.replaceAll("_", " ")}</h2>
                  </div>
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-black ${ready ? "bg-emerald-400/10 text-emerald-200" : "bg-aurum/10 text-aurum"}`}>{ready ? "Ready for launch" : "Needs review"}</span>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-6">
                  <div className="rounded-lg border border-white/10 bg-obsidian/60 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-aurum">Email subject</p>
                    <p className="mt-2 font-bold text-white">{email.subject}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-obsidian/60 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-aurum">Email preview</p>
                    <p className="mt-2 text-slate-200">{email.body}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-obsidian/60 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-aurum">WhatsApp preview</p>
                    <p className="mt-2 text-slate-200">{whatsapp.body}</p>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
