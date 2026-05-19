import { Save } from "lucide-react";
import { createLeadAction, updateLeadAction } from "@/lib/actions";
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
    source: "WhatsApp referral",
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
        description="Save lead data directly to PostgreSQL through Crystal Growth OS server actions."
      />
      <form action={mode === "create" ? createLeadAction : updateLeadAction} className="grid gap-4 lg:grid-cols-2">
        {mode === "edit" ? <input type="hidden" name="id" value={fallback.id} /> : null}
        <label className="text-sm font-bold text-slate-200">Name<input name="name" required className={`${inputClass} mt-2`} defaultValue={fallback.name} /></label>
        <label className="text-sm font-bold text-slate-200">Phone<input name="phone" required className={`${inputClass} mt-2`} defaultValue={fallback.phone} /></label>
        <label className="text-sm font-bold text-slate-200">Email<input name="email" required className={`${inputClass} mt-2`} type="email" defaultValue={fallback.email} /></label>
        <label className="text-sm font-bold text-slate-200">Business name<input name="businessName" required className={`${inputClass} mt-2`} defaultValue={fallback.businessName} /></label>
        <label className="text-sm font-bold text-slate-200">Business type<input name="businessType" className={`${inputClass} mt-2`} defaultValue={fallback.businessType} /></label>
        <label className="text-sm font-bold text-slate-200">Source
          <select name="source" className={`${inputClass} mt-2`} defaultValue={fallback.source}>{["Facebook ad", "Instagram DM", "WhatsApp referral", "Referral", "Walk-in", "Website form", "Google search", "LinkedIn"].map((source) => <option key={source}>{source}</option>)}</select>
        </label>
        <label className="text-sm font-bold text-slate-200">Service interested in<input name="serviceInterestedIn" required className={`${inputClass} mt-2`} defaultValue={fallback.serviceInterestedIn} /></label>
        <label className="text-sm font-bold text-slate-200">Status
          <select name="status" className={`${inputClass} mt-2`} defaultValue={fallback.status}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select>
        </label>
        <label className="text-sm font-bold text-slate-200">Deal value<input name="dealValue" className={`${inputClass} mt-2`} type="number" step="0.01" defaultValue={fallback.dealValue} /></label>
        <label className="text-sm font-bold text-slate-200">Estimated deal value<input name="estimatedDealValue" className={`${inputClass} mt-2`} type="number" step="0.01" defaultValue={fallback.estimatedDealValue} /></label>
        <label className="text-sm font-bold text-slate-200">Birthday<input name="birthday" className={`${inputClass} mt-2`} type="date" defaultValue={dateValue(fallback.birthday)} /></label>
        <label className="text-sm font-bold text-slate-200">Last contacted date<input name="lastContactedAt" className={`${inputClass} mt-2`} type="date" defaultValue={dateValue(fallback.lastContactedAt)} /></label>
        <label className="text-sm font-bold text-slate-200">Next follow-up date<input name="nextFollowUpDate" className={`${inputClass} mt-2`} type="date" defaultValue={dateValue(fallback.nextFollowUpDate)} /></label>
        <label className="lg:col-span-2 text-sm font-bold text-slate-200">Notes<textarea name="notes" className={`${inputClass} mt-2 min-h-32`} defaultValue={fallback.notes} /></label>
        <button type="submit" className={`${buttonClass} lg:col-span-2`}><Save size={18} /> Save Lead</button>
      </form>
    </Panel>
  );
}
