import { quoteFinalTotal, type Lead, type Quote } from "@/lib/mock-data";
import type { ActivityView, ContentPostView, PaymentView, ProductionJobView, ProofAssetView } from "@/lib/db-data";

export type DataHealthWarning = {
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  link: string;
  count: number;
};

type DataHealthInput = {
  leads: Lead[];
  quotes: Quote[];
  activities: ActivityView[];
  payments: PaymentView[];
  productionJobs: ProductionJobView[];
  proofAssets: ProofAssetView[];
  contentPosts: ContentPostView[];
};

function dueDate(value: string | null | undefined) {
  return value ? new Date(value) : null;
}

export function getDataHealthWarnings(data: DataHealthInput): DataHealthWarning[] {
  const now = new Date();
  const warnings: DataHealthWarning[] = [];

  const leadsWithNoNextAction = data.leads.filter((lead) => !lead.nextFollowUpDate && !data.activities.some((activity) => activity.leadId === lead.id && !activity.completedAt));
  if (leadsWithNoNextAction.length) warnings.push({
    severity: "warning",
    title: "Leads with no next action",
    message: "Some leads have no follow-up date or pending activity, so they can fall out of Money Today.",
    link: "/leads",
    count: leadsWithNoNextAction.length
  });

  const sentQuotesNoFollowUp = data.quotes.filter((quote) => quote.status === "Sent" && !data.activities.some((activity) => activity.leadId === quote.leadId && !activity.completedAt && /quote|follow/i.test(`${activity.title} ${activity.note}`)));
  if (sentQuotesNoFollowUp.length) warnings.push({
    severity: "critical",
    title: "Sent quotes without follow-up",
    message: "Sent quotes should have a pending quote follow-up so money does not go quiet.",
    link: "/quotes",
    count: sentQuotesNoFollowUp.length
  });

  const acceptedQuotesNoPayment = data.quotes.filter((quote) => quote.status === "Accepted" && !data.payments.some((payment) => payment.quoteId === quote.id));
  if (acceptedQuotesNoPayment.length) warnings.push({
    severity: "warning",
    title: "Accepted quotes with no payment",
    message: "Accepted quotes should be followed by a deposit/payment record.",
    link: "/quotes",
    count: acceptedQuotesNoPayment.length
  });

  const depositPaidNoProduction = data.quotes.filter((quote) => {
    const paid = data.payments.filter((payment) => payment.quoteId === quote.id).reduce((sum, payment) => sum + payment.amount, 0);
    return paid >= quoteFinalTotal(quote) * 0.6 && !data.productionJobs.some((job) => job.quoteId === quote.id);
  });
  if (depositPaidNoProduction.length) warnings.push({
    severity: "critical",
    title: "Deposit-paid quotes without production jobs",
    message: "Deposit-confirmed work should have a production job so operations can start.",
    link: "/production",
    count: depositPaidNoProduction.length
  });

  const completedJobsNoProof = data.productionJobs.filter((job) => ["COMPLETED", "REVIEW_REQUESTED"].includes(job.status) && !data.proofAssets.some((proof) => proof.productionJobId === job.id));
  if (completedJobsNoProof.length) warnings.push({
    severity: "warning",
    title: "Completed jobs without proof assets",
    message: "Completed work should create review, before/after, and referral opportunities.",
    link: "/api/debug/proof/sync",
    count: completedJobsNoProof.length
  });

  const proofWithoutContent = data.proofAssets.filter((proof) => !["ARCHIVED", "PUBLISHED"].includes(proof.status) && !data.contentPosts.some((post) => post.proofAssetId === proof.id));
  if (proofWithoutContent.length) warnings.push({
    severity: "info",
    title: "Proof assets without content drafts",
    message: "Proof assets can become social proof posts, testimonials, or case studies.",
    link: "/proof",
    count: proofWithoutContent.length
  });

  const unscheduledDrafts = data.contentPosts.filter((post) => ["DRAFTED", "READY"].includes(post.status) && !post.scheduledAt);
  if (unscheduledDrafts.length) warnings.push({
    severity: "info",
    title: "Content drafts not scheduled",
    message: "Drafted or ready posts should be scheduled or published to keep marketing momentum visible.",
    link: "/content-calendar",
    count: unscheduledDrafts.length
  });

  const outstandingBalances = data.quotes.filter((quote) => {
    const paid = data.payments.filter((payment) => payment.quoteId === quote.id).reduce((sum, payment) => sum + payment.amount, 0);
    return paid > 0 && paid < quoteFinalTotal(quote);
  });
  if (outstandingBalances.length) warnings.push({
    severity: "warning",
    title: "Payments with outstanding balance",
    message: "Partial payments need balance collection tasks before jobs disappear from the cash queue.",
    link: "/money-today",
    count: outstandingBalances.length
  });

  const overdueScheduled = data.contentPosts.filter((post) => post.status === "SCHEDULED" && dueDate(post.scheduledAt) && dueDate(post.scheduledAt)! < now);
  if (overdueScheduled.length) warnings.push({
    severity: "warning",
    title: "Scheduled content is overdue",
    message: "Some scheduled content has passed its publish date and should be marked published or rescheduled.",
    link: "/content-calendar",
    count: overdueScheduled.length
  });

  warnings.push({
    severity: "info",
    title: "Debug/admin routes enabled",
    message: "MVP debug routes are active and should be protected or removed before broader production use.",
    link: "/api/debug",
    count: 1
  });

  return warnings;
}
