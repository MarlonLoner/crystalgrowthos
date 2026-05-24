import { formatCurrency } from "@/lib/formatters";

export type CommunicationTemplateChannel = "EMAIL" | "WHATSAPP" | "SMS" | "INTERNAL_NOTE";

export type CommunicationTemplateContext = {
  lead?: {
    name?: string | null;
    businessName?: string | null;
    serviceInterestedIn?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  quote?: {
    quoteNumber?: string | null;
    businessName?: string | null;
    serviceCategory?: string | null;
    finalTotal?: number | string | null;
  } | null;
  job?: {
    title?: string | null;
    installationDate?: string | Date | null;
  } | null;
  amount?: number | string | null;
  balance?: number | string | null;
  missingAssets?: string[];
  scheduledDate?: string | Date | null;
};

export type CommunicationTemplate = {
  subject?: string;
  body: string;
};

function name(ctx: CommunicationTemplateContext) {
  return ctx.lead?.name?.trim() || "there";
}

function business(ctx: CommunicationTemplateContext) {
  return ctx.lead?.businessName || ctx.quote?.businessName || "your business";
}

function service(ctx: CommunicationTemplateContext) {
  return ctx.lead?.serviceInterestedIn || ctx.quote?.serviceCategory || "branding project";
}

function quoteTotal(ctx: CommunicationTemplateContext) {
  return formatCurrency(ctx.quote?.finalTotal ?? 0);
}

function dateText(value?: string | Date | null) {
  if (!value) return "the scheduled date";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const templates: Record<string, (ctx: CommunicationTemplateContext, channel: CommunicationTemplateChannel) => CommunicationTemplate> = {
  NEW_LEAD: (ctx) => ({
    subject: `Branding request received - Crystal Branding Studio`,
    body: `Hi ${name(ctx)}, thanks for contacting Crystal Branding Studio about ${service(ctx)} for ${business(ctx)}. We have received your request. Please send any logo, shopfront photo, sizes, or inspiration you have so we can guide you properly.`
  }),
  ASSETS_RECEIVED: (ctx) => ({
    subject: `Assets received for ${business(ctx)}`,
    body: `Hi ${name(ctx)}, we have received your shopfront/logo assets for ${business(ctx)}. Our team will review them and come back with the next step for your ${service(ctx)}.`
  }),
  MISSING_ASSETS: (ctx) => ({
    subject: `Assets needed for your Crystal mockup`,
    body: `Hi ${name(ctx)}, we can start preparing your mockup for ${business(ctx)}. Please send ${ctx.missingAssets?.join(" and ") || "your shopfront photo and logo"} so we can make it accurate.`
  }),
  MOCKUP_IN_DESIGN: (ctx) => ({
    subject: `Your mockup is in design`,
    body: `Hi ${name(ctx)}, quick update from Crystal Branding Studio: your ${service(ctx)} mockup for ${business(ctx)} is now in design. We will share the visual once it is ready.`
  }),
  MOCKUP_SENT: (ctx) => ({
    subject: `Following up on your mockup`,
    body: `Hi ${name(ctx)}, just checking if you are happy with the mockup for ${business(ctx)}. If it looks good, we can prepare the quote and next steps for production.`
  }),
  QUOTE_CREATED: (ctx) => ({
    subject: `Quote ${ctx.quote?.quoteNumber ?? ""} prepared`,
    body: `Hi ${name(ctx)}, we have prepared quote ${ctx.quote?.quoteNumber ?? ""} for ${business(ctx)}. The total is ${quoteTotal(ctx)}. Please review it and tell us if you would like to proceed or adjust anything.`
  }),
  QUOTE_SENT: (ctx) => ({
    subject: `Quote ${ctx.quote?.quoteNumber ?? ""} from Crystal Branding Studio`,
    body: `Hi ${name(ctx)}, quote ${ctx.quote?.quoteNumber ?? ""} for ${business(ctx)} is ready. Total: ${quoteTotal(ctx)}. To proceed, please confirm and we will guide you on the deposit/payment step.`
  }),
  DEPOSIT_REMINDER: (ctx) => ({
    subject: `Deposit reminder for ${business(ctx)}`,
    body: `Hi ${name(ctx)}, just following up on the deposit for your ${service(ctx)}. Once confirmed, we can move the job into production.`
  }),
  PAYMENT_RECEIVED: (ctx) => ({
    subject: `Payment received - thank you`,
    body: `Hi ${name(ctx)}, thank you. We have recorded your payment${ctx.amount ? ` of ${formatCurrency(ctx.amount)}` : ""} for ${business(ctx)}. We will keep you updated on the next production step.`
  }),
  PRODUCTION_STARTED: (ctx) => ({
    subject: `Production has started`,
    body: `Hi ${name(ctx)}, your ${service(ctx)} job for ${business(ctx)} has moved into production. We will update you as it progresses.`
  }),
  INSTALLATION_SCHEDULED: (ctx) => ({
    subject: `Installation scheduled`,
    body: `Hi ${name(ctx)}, your installation for ${business(ctx)} is scheduled for ${dateText(ctx.scheduledDate ?? ctx.job?.installationDate)}. Please confirm access and availability on your side.`
  }),
  BALANCE_REMINDER: (ctx) => ({
    subject: `Balance reminder for ${business(ctx)}`,
    body: `Hi ${name(ctx)}, your job has been delivered/installed. The remaining balance is ${formatCurrency(ctx.balance ?? 0)}. Please confirm payment so we can close everything off properly.`
  }),
  JOB_COMPLETED: (ctx) => ({
    subject: `Thank you from Crystal Branding Studio`,
    body: `Hi ${name(ctx)}, thank you for trusting Crystal Branding Studio with ${business(ctx)}. We hope the finished work helps your business stand out and attract more customers.`
  }),
  REVIEW_REQUEST: (ctx) => ({
    subject: `Could you share a quick review?`,
    body: `Hi ${name(ctx)}, thank you again for choosing Crystal Branding Studio. If you are happy with the work, please send us a short review/testimonial. It helps other business owners trust us too.`
  }),
  REFERRAL_REQUEST: (ctx) => ({
    subject: `Referral request`,
    body: `Hi ${name(ctx)}, if you know another business that needs signage, branding, or visibility support, please feel free to refer them to Crystal Branding Studio. We would appreciate it.`
  }),
  CONTENT_PERMISSION: (ctx) => ({
    subject: `Permission to share completed work`,
    body: `Hi ${name(ctx)}, the completed branding for ${business(ctx)} looks great. May we share before/after photos or a short post on our pages as part of our portfolio?`
  }),
  CUSTOM: () => ({
    subject: "Crystal Branding Studio update",
    body: "Hi, here is a quick update from Crystal Branding Studio."
  })
};

export function getCommunicationTemplate(trigger: string, channel: CommunicationTemplateChannel, ctx: CommunicationTemplateContext): CommunicationTemplate {
  return (templates[trigger] ?? templates.CUSTOM)(ctx, channel);
}
