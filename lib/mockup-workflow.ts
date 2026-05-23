import type { ActivityView, LeadAssetView } from "@/lib/db-data";
import { Lead, Quote } from "@/lib/mock-data";
import { generateWhatsAppScript, ScriptType } from "@/lib/scripts";

export type MockupStatus =
  | "New Request"
  | "Needs Assets"
  | "Assets Received"
  | "In Design"
  | "Mockup Sent"
  | "Ready for Quote"
  | "Converted to Quote"
  | "Dormant / Lost";

export type MockupWorkflow = {
  status: MockupStatus;
  urgency: string;
  assetCount: number;
  hasShopfrontImage: boolean;
  hasLogo: boolean;
  missingAssets: string[];
  latestActivity: ActivityView | null;
  suggestedNextAction: string;
  scriptType: ScriptType;
  message: string;
  isMockupLead: boolean;
};

export const mockupColumns: MockupStatus[] = [
  "New Request",
  "Needs Assets",
  "Assets Received",
  "In Design",
  "Mockup Sent",
  "Ready for Quote",
  "Converted to Quote",
  "Dormant / Lost"
];

function noteValue(notes: string, label: string) {
  const line = notes.split(/\r?\n/).find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return line ? line.slice(label.length + 1).trim() : "Not provided";
}

function activityIncludes(activity: ActivityView, text: string) {
  const needle = text.toLowerCase();
  return `${activity.title} ${activity.note}`.toLowerCase().includes(needle);
}

function isOlderThanDays(dateValue: string | null | undefined, days: number) {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() > days * 24 * 60 * 60 * 1000;
}

export function isMockupRelatedLead(lead: Lead) {
  return /shopfront|mockup/i.test(`${lead.source} ${lead.serviceInterestedIn} ${lead.notes}`);
}

export function inferMockupWorkflow(lead: Lead, assets: LeadAssetView[] = [], activities: ActivityView[] = [], quotes: Quote[] = []): MockupWorkflow {
  const relatedActivities = activities.filter((activity) => activity.leadId === lead.id);
  const relatedAssets = assets.filter((asset) => asset.leadId === lead.id);
  const relatedQuotes = quotes.filter((quote) => quote.leadId === lead.id);
  const latestActivity = [...relatedActivities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null;
  const hasShopfrontImage = relatedAssets.some((asset) => asset.type === "SHOPFRONT_IMAGE");
  const hasLogo = relatedAssets.some((asset) => asset.type === "LOGO");
  const missingAssets = [
    !hasShopfrontImage ? "missing shopfront image" : "",
    !hasLogo ? "missing logo" : ""
  ].filter(Boolean);
  const hasInDesign = relatedActivities.some((activity) => activityIncludes(activity, "Mockup in design"));
  const hasMockupSent = relatedActivities.some((activity) => activityIncludes(activity, "Mockup sent"));
  const pendingPrepareTask = relatedActivities.find((activity) => activity.title.toLowerCase().includes("prepare and send mockup") && !activity.completedAt);
  const pendingMockupFollowUp = relatedActivities.find((activity) => activity.title.toLowerCase().includes("follow up on mockup") && !activity.completedAt);
  const hasReadyForQuote = relatedActivities.some((activity) => activityIncludes(activity, "Ready for quote"));
  const dormant = lead.status === "Lost" || isOlderThanDays(latestActivity?.createdAt ?? lead.createdAt, 21);

  let status: MockupStatus = "New Request";
  let suggestedNextAction = "Review the request and confirm the next production step.";
  let scriptType: ScriptType = "confirm-assets-received";

  if (lead.status === "Lost" || dormant) {
    status = "Dormant / Lost";
    suggestedNextAction = "Revive the request or close it properly.";
    scriptType = "dead-lead-revival";
  } else if (relatedQuotes.length > 0) {
    status = "Converted to Quote";
    suggestedNextAction = "Track quote response and payment decision.";
    scriptType = "quote-after-mockup";
  } else if (hasReadyForQuote) {
    status = "Ready for Quote";
    suggestedNextAction = "Create Quote";
    scriptType = "quote-after-mockup";
  } else if (hasMockupSent) {
    status = "Mockup Sent";
    suggestedNextAction = pendingMockupFollowUp ? "Follow up on mockup: check if the client likes it and wants a quote." : "Follow up on mockup";
    scriptType = "quote-after-mockup";
  } else if (hasInDesign && !hasMockupSent) {
    status = "In Design";
    suggestedNextAction = pendingPrepareTask ? "Prepare and send mockup: finish the design and send it to the client." : "Prepare and send mockup";
    scriptType = "mockup-ready";
  } else if (missingAssets.length > 0) {
    status = "Needs Assets";
    suggestedNextAction = missingAssets.includes("missing logo") ? "Request the missing logo file." : "Request a clear shopfront photo.";
    scriptType = missingAssets.includes("missing logo") ? "request-missing-logo" : "request-shopfront-photo";
  } else if (relatedAssets.length > 0) {
    status = "Assets Received";
    suggestedNextAction = "Move the mockup into design.";
    scriptType = "confirm-assets-received";
  }

  return {
    status,
    urgency: noteValue(lead.notes, "Urgency"),
    assetCount: relatedAssets.length,
    hasShopfrontImage,
    hasLogo,
    missingAssets,
    latestActivity,
    suggestedNextAction,
    scriptType,
    message: generateWhatsAppScript(scriptType, lead),
    isMockupLead: isMockupRelatedLead(lead)
  };
}

export function getMockupWorkflowItems(leads: Lead[], assets: LeadAssetView[] = [], activities: ActivityView[] = [], quotes: Quote[] = []) {
  return leads
    .filter(isMockupRelatedLead)
    .map((lead) => ({
      lead,
      workflow: inferMockupWorkflow(lead, assets, activities, quotes),
      quotes: quotes.filter((quote) => quote.leadId === lead.id),
      assets: assets.filter((asset) => asset.leadId === lead.id),
      activities: activities.filter((activity) => activity.leadId === lead.id)
    }));
}