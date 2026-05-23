import { PaymentView } from "@/lib/payment-intelligence";
import { Quote } from "@/lib/mock-data";
import { getPaymentSummary } from "@/lib/payment-intelligence";

export type ProductionJobView = {
  id: string;
  quoteId: string;
  leadId: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  installationDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const statusLabels: Record<string, string> = {
  READY_TO_START: "Ready to Start",
  DESIGN_ARTWORK: "Design / Artwork",
  PRINTING_FABRICATION: "Printing / Fabrication",
  INSTALLATION_SCHEDULED: "Installation Scheduled",
  INSTALLED_DELIVERED: "Installed / Delivered",
  AWAITING_BALANCE: "Awaiting Balance",
  COMPLETED: "Completed",
  REVIEW_REQUESTED: "Review Requested",
  CANCELLED: "Cancelled"
};

export function productionStatusLabel(status: string) {
  return statusLabels[status] ?? status.replaceAll("_", " ");
}

export function getProductionSummary(job: ProductionJobView, quote: Quote, payments: PaymentView[] = []) {
  const payment = getPaymentSummary(quote, payments);
  const today = new Date();
  const due = job.dueDate ? new Date(job.dueDate) : null;
  const daysUntilDue = due ? Math.ceil((due.getTime() - today.getTime()) / 86400000) : null;
  const balanceRemains = payment.balanceRemaining > 0;
  const installationScheduled = Boolean(job.installationDate);
  const reviewShouldBeRequested = job.status === "COMPLETED" || job.status === "INSTALLED_DELIVERED";

  let suggestedNextAction = "Start production";
  if (job.status === "DESIGN_ARTWORK") suggestedNextAction = "Approve artwork and move to fabrication";
  if (job.status === "PRINTING_FABRICATION") suggestedNextAction = "Finish fabrication and schedule installation";
  if (job.status === "INSTALLATION_SCHEDULED") suggestedNextAction = "Install / deliver job";
  if (job.status === "INSTALLED_DELIVERED" && balanceRemains) suggestedNextAction = "Collect balance";
  if (job.status === "INSTALLED_DELIVERED" && !balanceRemains) suggestedNextAction = "Mark completed";
  if (job.status === "AWAITING_BALANCE") suggestedNextAction = "Collect balance";
  if (job.status === "COMPLETED") suggestedNextAction = "Request review and create content";
  if (job.status === "REVIEW_REQUESTED") suggestedNextAction = "Track review/testimonial";
  if (job.status === "CANCELLED") suggestedNextAction = "No active production action";

  return {
    statusLabel: productionStatusLabel(job.status),
    suggestedNextAction,
    balanceRemains,
    installationScheduled,
    reviewShouldBeRequested,
    priority: job.priority,
    daysUntilDue,
    payment
  };
}