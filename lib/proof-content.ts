import type { Lead, Quote } from "@/lib/mock-data";
import type { ProductionJobView } from "@/lib/db-data";
import { currency } from "@/lib/utils";

export function generateProofContentDrafts({ lead, quote, job }: { lead: Lead; quote?: Quote | null; job?: ProductionJobView | null }) {
  const service = quote?.serviceCategory ?? lead.serviceInterestedIn;
  const total = quote ? currency(quote.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) - quote.discount) : "";
  const jobTitle = job?.title ?? service;

  return {
    facebookCaption: `Another Crystal Branding Studio project completed for ${lead.businessName}. We helped with ${service}, focused on visibility, clean finishing, and a stronger brand presence. Need your business to stand out? Message us for a quote.`,
    whatsAppStatusCaption: `${lead.businessName} looking sharper with ${service} by Crystal Branding Studio. DM us for branding, signage, vinyl, banners, and shopfront work.`,
    beforeAfterCaption: `Before and after: ${lead.businessName}. From plain frontage to a stronger branded look with ${service}. This is what practical visibility can do for a business.`,
    caseStudyParagraph: `${lead.businessName} needed ${service.toLowerCase()} that looked professional and helped customers notice the business quickly. Crystal Branding Studio handled ${jobTitle.toLowerCase()} with a practical production flow${total ? ` and a project value of ${total}` : ""}. The result is a cleaner, more visible brand presence ready for daily trading.`
  };
}
