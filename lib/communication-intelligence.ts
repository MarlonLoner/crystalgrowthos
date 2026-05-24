import type { CommunicationView } from "@/lib/db-data";

export function communicationChannelLabel(channel: string) {
  return channel.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function communicationTriggerLabel(trigger: string) {
  return trigger.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function communicationStatusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function isCommunicationOverdue(communication: Pick<CommunicationView, "status" | "scheduledFor" | "createdAt">) {
  if (communication.status === "SCHEDULED" && communication.scheduledFor) return new Date(communication.scheduledFor) < new Date();
  return false;
}

export function hasMissingRecipientDetails(communication: Pick<CommunicationView, "channel" | "recipientEmail" | "recipientPhone">) {
  if (communication.channel === "EMAIL") return !communication.recipientEmail;
  if (communication.channel === "WHATSAPP" || communication.channel === "SMS") return !communication.recipientPhone;
  return false;
}

export function getCommunicationPriority(communication: CommunicationView): "High" | "Medium" | "Low" {
  if (communication.status === "FAILED" || isCommunicationOverdue(communication) || hasMissingRecipientDetails(communication)) return "High";
  if (["READY", "SCHEDULED"].includes(communication.status)) return "Medium";
  return "Low";
}

export function getCommunicationSuggestedAction(communication: CommunicationView) {
  if (hasMissingRecipientDetails(communication)) return "Add missing recipient details";
  if (communication.status === "FAILED") return "Review failed message";
  if (communication.status === "SCHEDULED" && isCommunicationOverdue(communication)) return "Send scheduled message";
  if (communication.status === "DRAFT") return "Review and mark ready";
  if (communication.status === "READY") return "Send or copy message";
  if (communication.status === "SENT") return "No action needed";
  if (communication.status === "SKIPPED") return "Skipped";
  return "Review communication";
}
