import { Save } from "lucide-react";
import { Lead, leads, stages } from "@/lib/mock-data";
import { buttonClass, inputClass, Panel, SectionHeading } from "@/components/ui";

function dateValue(value: string | null | undefined) {
  return value ?? "";
}

export function LeadForm({ mode, lead }: { mode: "create" | "edit"; lead?: Lead }) {
  const fallback = lead ?? {
    ...leads[0],
    id: "new",
    name: "",
    phone: "+263 ",
    email: "",
    businessName: "",
    businessType: "",
    source: "WhatsApp",
    serviceInterestedIn: "3D signage",
    status: "New Lead" as const,
    dealValue: 0,
    estimatedDealValue: 0,
    birthday: "",
    notes: "",
    lastContactedAt: null,
    nextFollowUpDate: ""
  };

  return (
    <Panel>
      <SectionHeading
        eyebrow={mode === "create" ? "Capture Lead" : "Edit Lead"}
        title={mode === "create" ? "Add a new money opportunity" : `Update ${fallback.name}`}
        description="MVP lead form matching the Prisma model. Server persistence can be wired in the next pass."
      />
      <form className="grid gap-4 lg:grid-cols-2">
        <label className="text-sm font-bold text-slate-200">Name<input className={`${inputClass} mt-2`} defaultValue={fallback.name} /></label>
        <label className="text-sm font-bold text-slate-200">Phone<input className={`${inputClass} mt-2`} defaultValue={fallback.phone} /></label>
        <label className="text-sm font-bold text-slate-200">Email<input className={`${inputClass} mt-2`} type="email" defaultValue={fallback.email} /></label>
        <label className="text-sm font-bold text-slate-200">Business name<input className={`${inputClass} mt-2`} defaultValue={fallback.businessName} /></label>
        <label className="text-sm font-bold text-slate-200">Business type<input className={`${inputClass} mt-2`} defaultValue={fallback.businessType} /></label>
        <label className="text-sm font-bold text-slate-200">Source
          <select className={`${inputClass} mt-2`} defaultValue={fallback.source}>{["Facebook ad", "Instagram DM", "WhatsApp referral", "Referral", "Walk-in", "Website form", "Google search", "LinkedIn"].map((source) => <option key={source}>{source}</option>)}</select>
        </label>
        <label className="text-sm font-bold text-slate-200">Service interested in<input className={`${inputClass} mt-2`} defaultValue={fallback.serviceInterestedIn} /></label>
        <label className="text-sm font-bold text-slate-200">Status
          <select className={`${inputClass} mt-2`} defaultValue={fallback.status}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select>
        </label>
        <label className="text-sm font-bold text-slate-200">Deal value<input className={`${inputClass} mt-2`} type="number" defaultValue={fallback.dealValue} /></label>
        <label className="text-sm font-bold text-slate-200">Estimated deal value<input className={`${inputClass} mt-2`} type="number" defaultValue={fallback.estimatedDealValue} /></label>
        <label className="text-sm font-bold text-slate-200">Birthday<input className={`${inputClass} mt-2`} type="date" defaultValue={dateValue(fallback.birthday)} /></label>
        <label className="text-sm font-bold text-slate-200">Last contacted date<input className={`${inputClass} mt-2`} type="date" defaultValue={dateValue(fallback.lastContactedAt)} /></label>
        <label className="text-sm font-bold text-slate-200">Next follow-up date<input className={`${inputClass} mt-2`} type="date" defaultValue={dateValue(fallback.nextFollowUpDate)} /></label>
        <label className="lg:col-span-2 text-sm font-bold text-slate-200">Notes<textarea className={`${inputClass} mt-2 min-h-32`} defaultValue={fallback.notes} /></label>
        <button type="button" className={`${buttonClass} lg:col-span-2`}><Save size={18} /> Save Lead</button>
      </form>
    </Panel>
  );
}

