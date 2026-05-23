import { currency } from "@/lib/utils";

type ProofLeadInput = {
  [key: string]: unknown;
  businessName: string;
  serviceInterestedIn: string;
};

type ProofQuoteInput = {
  [key: string]: unknown;
  serviceCategory: string;
  discount?: number | string | null;
  lineItems?: Array<{ quantity: number; unitPrice: number | string }>;
};

type ProofJobInput = {
  [key: string]: unknown;
  title: string;
};

export function generateProofContentDrafts({ lead, quote, job }: { lead: ProofLeadInput; quote?: ProofQuoteInput | null; job?: ProofJobInput | null }) {
  const service = quote?.serviceCategory ?? lead.serviceInterestedIn;
  const total = quote
    ? currency((quote.lineItems ?? []).reduce((sum, item) => sum + item.quantity * Number(item.unitPrice), 0) - Number(quote.discount ?? 0))
    : "";
  const jobTitle = job?.title ?? service;

  return {
    facebookCaption: `Another Crystal Branding Studio project completed for ${lead.businessName}. We helped with ${service}, focused on visibility, clean finishing, and a stronger brand presence. Need your business to stand out? Message us for a quote.`,
    whatsAppStatusCaption: `${lead.businessName} looking sharper with ${service} by Crystal Branding Studio. DM us for branding, signage, vinyl, banners, and shopfront work.`,
    beforeAfterCaption: `Before and after: ${lead.businessName}. From plain frontage to a stronger branded look with ${service}. This is what practical visibility can do for a business.`,
    caseStudyParagraph: `${lead.businessName} needed ${service.toLowerCase()} that looked professional and helped customers notice the business quickly. Crystal Branding Studio handled ${jobTitle.toLowerCase()} with a practical production flow${total ? ` and a project value of ${total}` : ""}. The result is a cleaner, more visible brand presence ready for daily trading.`
  };
}

