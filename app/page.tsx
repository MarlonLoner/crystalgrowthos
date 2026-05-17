import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardOverview } from "@/components/dashboard-overview";
import { LeadDatabase } from "@/components/lead-database";
import { SalesPipeline } from "@/components/sales-pipeline";
import { ContentEngine } from "@/components/content-engine";
import { EmailCampaignEngine } from "@/components/email-campaign-engine";
import { AutomationCenter } from "@/components/automation-center";
import { Reports } from "@/components/reports";
import { StrategyAssistant } from "@/components/strategy-assistant";
import { leads } from "@/lib/mock-data";

export default function Home() {
  return (
    <DashboardShell>
      <section id="dashboard" className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-aurum">
              Crystal Branding Studio
            </p>
            <h1 className="mt-2 text-4xl font-black text-white md:text-5xl">
              Crystal Growth OS
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-mercury">
            Internal marketing command center for leads, sales follow-ups, AI content,
            campaign drafts, automations, and monthly growth decisions.
          </p>
        </div>
        <DashboardOverview leads={leads} />
      </section>

      <StrategyAssistant />
      <LeadDatabase initialLeads={leads} />
      <SalesPipeline initialLeads={leads} />
      <ContentEngine />
      <EmailCampaignEngine />
      <AutomationCenter />
      <Reports />
    </DashboardShell>
  );
}
