import { quoteFinalTotal, type Lead, type Quote } from "@/lib/mock-data";
import type { ActivityView, CommunicationView, ContentPostView, PaymentView, ProductionJobView, ProofAssetView } from "@/lib/db-data";

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
  communications?: CommunicationView[];
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
  const emailSendingConfigured = Boolean(process.env.RESEND_API_KEY);
  const emailFromConfigured = Boolean(process.env.EMAIL_FROM);
  const emailTestMode = ["1", "true", "yes", "on"].includes(String(process.env.EMAIL_TEST_MODE ?? "").toLowerCase());
  const emailTestRecipientConfigured = Boolean(process.env.EMAIL_TEST_RECIPIENT);
  const autoEmailEnabled = String(process.env.AUTO_EMAIL_ENABLED ?? "").toLowerCase() === "true";
  const cronSecretConfigured = Boolean(process.env.CRON_SECRET);
  if (!autoEmailEnabled) warnings.push({
    severity: "info",
    title: "Scheduled email automation disabled",
    message: "AUTO_EMAIL_ENABLED is not true, so due scheduled EMAIL communications will wait for manual Send Email.",
    link: "/system-health",
    count: 1
  });
  if (autoEmailEnabled && !cronSecretConfigured) warnings.push({
    severity: "critical",
    title: "Cron secret missing",
    message: "Set CRON_SECRET before enabling scheduled email automation.",
    link: "/system-health",
    count: 1
  });
  if (autoEmailEnabled && !emailTestMode) warnings.push({
    severity: "warning",
    title: "Live scheduled email sending enabled",
    message: "AUTO_EMAIL_ENABLED is true and EMAIL_TEST_MODE is off. Review /communication/templates before launch sending.",
    link: "/communication/templates",
    count: 1
  });
  if (emailSendingConfigured && !emailFromConfigured) warnings.push({
    severity: "critical",
    title: "Email sending enabled without EMAIL_FROM",
    message: "Set EMAIL_FROM before sending emails through Resend.",
    link: "/system-health",
    count: 1
  });
  if (emailTestMode && !emailTestRecipientConfigured) warnings.push({
    severity: "critical",
    title: "Email test mode needs recipient",
    message: "EMAIL_TEST_MODE is active, but EMAIL_TEST_RECIPIENT is not configured.",
    link: "/system-health",
    count: 1
  });
  const failedEmails = (data.communications ?? []).filter((item) => item.channel === "EMAIL" && item.status === "FAILED");
  if (failedEmails.length) warnings.push({
    severity: "critical",
    title: "Failed email communications",
    message: "Some EMAIL communications failed and need review before clients miss updates.",
    link: "/communication",
    count: failedEmails.length
  });
  const readyEmails = (data.communications ?? []).filter((item) => item.channel === "EMAIL" && item.status === "READY");
  if (readyEmails.length) warnings.push({
    severity: "warning",
    title: "Ready emails not sent",
    message: "Approved EMAIL communications are ready but have not been sent yet.",
    link: "/communication",
    count: readyEmails.length
  });
  const oldDrafts = (data.communications ?? []).filter((item) => item.status === "DRAFT" && new Date(item.createdAt) < new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000));
  if (oldDrafts.length) warnings.push({
    severity: "warning",
    title: "Communication drafts older than 3 days",
    message: "Client message drafts should be reviewed, sent, or skipped so the OS does not become a parking lot.",
    link: "/communication",
    count: oldDrafts.length
  });

  const dueScheduledEmails = (data.communications ?? []).filter((item) => item.channel === "EMAIL" && item.status === "SCHEDULED" && dueDate(item.scheduledFor) && dueDate(item.scheduledFor)! <= now);
  if (dueScheduledEmails.length) warnings.push({
    severity: autoEmailEnabled ? "warning" : "critical",
    title: "Due scheduled emails",
    message: autoEmailEnabled ? "Scheduled EMAIL communications are due and should be handled by the cron run." : "Scheduled EMAIL communications are due, but automation is disabled.",
    link: "/communication",
    count: dueScheduledEmails.length
  });

  const failedScheduledEmails = (data.communications ?? []).filter((item) => item.channel === "EMAIL" && item.status === "FAILED" && item.scheduledFor);
  if (failedScheduledEmails.length) warnings.push({
    severity: "critical",
    title: "Failed scheduled emails",
    message: "Some scheduled EMAIL communications failed and need review before retrying.",
    link: "/communication",
    count: failedScheduledEmails.length
  });

  const overdueCommunications = (data.communications ?? []).filter((item) => item.status === "SCHEDULED" && dueDate(item.scheduledFor) && dueDate(item.scheduledFor)! < now);
  if (overdueCommunications.length) warnings.push({
    severity: "critical",
    title: "Scheduled communications overdue",
    message: "Some client messages were scheduled for the past and need to be sent or rescheduled.",
    link: "/communication",
    count: overdueCommunications.length
  });

  const failedCommunications = (data.communications ?? []).filter((item) => item.status === "FAILED");
  if (failedCommunications.length) warnings.push({
    severity: "critical",
    title: "Failed communications",
    message: "Failed messages need review before clients miss key updates.",
    link: "/communication",
    count: failedCommunications.length
  });

  const leadsMissingContact = data.leads.filter((lead) => !lead.email && !lead.phone);
  if (leadsMissingContact.length) warnings.push({
    severity: "warning",
    title: "Leads missing email and phone",
    message: "These leads cannot receive WhatsApp or email automation drafts until contact details are added.",
    link: "/leads",
    count: leadsMissingContact.length
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




