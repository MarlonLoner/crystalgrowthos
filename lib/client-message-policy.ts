export type CommunicationTriggerName =
  | "NEW_LEAD"
  | "ASSETS_RECEIVED"
  | "MISSING_ASSETS"
  | "MOCKUP_IN_DESIGN"
  | "MOCKUP_SENT"
  | "QUOTE_CREATED"
  | "QUOTE_SENT"
  | "DEPOSIT_REMINDER"
  | "PAYMENT_RECEIVED"
  | "PRODUCTION_STARTED"
  | "INSTALLATION_SCHEDULED"
  | "BALANCE_REMINDER"
  | "JOB_COMPLETED"
  | "REVIEW_REQUEST"
  | "REFERRAL_REQUEST"
  | "CONTENT_PERMISSION"
  | "CUSTOM"
  | string;

export type ClientMessagePriority = "HIGH" | "MEDIUM" | "LOW";

export type ExistingCommunicationForPolicy = {
  id: string;
  leadId: string | null;
  channel: string;
  trigger: string;
  status: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
};

const highPriorityTriggers = new Set(["QUOTE_SENT", "PAYMENT_RECEIVED", "INSTALLATION_SCHEDULED", "BALANCE_REMINDER", "JOB_COMPLETED"]);
const mediumPriorityTriggers = new Set(["NEW_LEAD", "ASSETS_RECEIVED", "MISSING_ASSETS", "MOCKUP_SENT", "PRODUCTION_STARTED", "REVIEW_REQUEST"]);
const alwaysAllowedHighPriorityTriggers = new Set(["QUOTE_SENT", "PAYMENT_RECEIVED", "INSTALLATION_SCHEDULED", "BALANCE_REMINDER", "REVIEW_REQUEST"]);

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function asTime(value: Date | string) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

export function getCommunicationPriority(trigger: CommunicationTriggerName): ClientMessagePriority {
  if (highPriorityTriggers.has(String(trigger))) return "HIGH";
  if (mediumPriorityTriggers.has(String(trigger))) return "MEDIUM";
  return "LOW";
}

export function priorityRank(priority: ClientMessagePriority) {
  return priority === "HIGH" ? 3 : priority === "MEDIUM" ? 2 : 1;
}

export function isHighPriorityCommunication(trigger: CommunicationTriggerName) {
  return alwaysAllowedHighPriorityTriggers.has(String(trigger));
}

export function mergeCompatibleTriggers(triggers: string[]) {
  const set = new Set(triggers);
  if (set.has("QUOTE_CREATED") && set.has("QUOTE_SENT")) return "QUOTE_SENT";
  if (set.has("PAYMENT_RECEIVED") && set.has("PRODUCTION_STARTED")) return "PAYMENT_RECEIVED";
  if (set.has("JOB_COMPLETED") && set.has("REVIEW_REQUEST")) return "REVIEW_REQUEST";
  if (set.has("MOCKUP_IN_DESIGN") && set.has("MOCKUP_SENT")) return "MOCKUP_SENT";
  return triggers.sort((a, b) => priorityRank(getCommunicationPriority(b)) - priorityRank(getCommunicationPriority(a)))[0] ?? "CUSTOM";
}

export function getSuppressionReason(input: {
  leadId?: string | null;
  trigger: CommunicationTriggerName;
  channel: string;
  existing: ExistingCommunicationForPolicy[];
  windowHours?: number;
}) {
  const leadId = input.leadId ?? null;
  if (!leadId) return null;

  const trigger = String(input.trigger);
  const priority = getCommunicationPriority(trigger);
  const windowStart = hoursAgo(input.windowHours ?? 48).getTime();
  const dayStart = hoursAgo(24).getTime();
  const active = input.existing.filter((item) => item.leadId === leadId && item.channel === input.channel && ["DRAFT", "READY", "SCHEDULED"].includes(item.status));

  const duplicate = active.find((item) => item.trigger === trigger && asTime(item.createdAt) >= windowStart);
  if (duplicate) return `Suppressed because a ${trigger.replaceAll("_", " ").toLowerCase()} draft already exists for this client in the last ${input.windowHours ?? 48} hours.`;

  const recentActive = active.find((item) => asTime(item.createdAt) >= dayStart);
  if (recentActive && !isHighPriorityCommunication(trigger)) return `Suppressed because a recent ${recentActive.trigger.replaceAll("_", " ").toLowerCase()} ${recentActive.status.toLowerCase()} message already exists for this client.`;

  if (priority === "LOW") {
    const higherPriority = active.find((item) => priorityRank(getCommunicationPriority(item.trigger)) > priorityRank(priority));
    if (higherPriority) return `Suppressed because a higher-priority ${higherPriority.trigger.replaceAll("_", " ").toLowerCase()} message already exists.`;
  }

  return null;
}

export function shouldSuppressDraft(input: Parameters<typeof getSuppressionReason>[0]) {
  return Boolean(getSuppressionReason(input));
}
