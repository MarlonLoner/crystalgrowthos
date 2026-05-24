import type { Lead, Quote } from "@/lib/mock-data";
import type { ProductionJobView, ProofAssetView } from "@/lib/db-data";

type Context = {
  lead: Pick<Lead, "businessName" | "name" | "serviceInterestedIn">;
  quote?: Pick<Quote, "serviceCategory" | "quoteNumber"> | null;
  job?: Pick<ProductionJobView, "title"> | null;
  proof?: Pick<ProofAssetView, "type" | "title" | "content"> | null;
};

function service(ctx: Context) {
  return ctx.quote?.serviceCategory ?? ctx.lead.serviceInterestedIn;
}

export function generateContentTemplates(ctx: Context) {
  const work = service(ctx);
  const business = ctx.lead.businessName;
  const project = ctx.job?.title ?? work;

  return {
    facebookCompletedProject: `Another completed project by Crystal Branding Studio for ${business}. We helped with ${work}, built for visibility, trust, and a stronger business presence. If your brand needs to stand out, message us for a practical quote.`,
    whatsAppStatusCaption: `${business} now standing out with ${work} by Crystal Branding Studio. Signage, branding, vinyl, banners, and shopfronts that help customers notice you.`,
    beforeAfterCaption: `Before and after: ${business}. From ordinary to more visible with ${work}. Good branding should help people find you, trust you, and remember you.`,
    testimonialCaption: `Client proof from ${business}: ${ctx.proof?.content || "Another happy client trusted Crystal Branding Studio with their branding work."}`,
    caseStudyParagraph: `${business} needed ${work.toLowerCase()} that looked professional and worked in the real world. Crystal Branding Studio handled ${project.toLowerCase()} with practical design, production, and finishing focused on visibility and trust.`,
    referralProofCaption: `A happy client is the best proof. If you know a business that needs signage, banners, vinyl, shopfront branding, or brand visibility, send them to Crystal Branding Studio.`
  };
}

export function captionForProof(ctx: Context, format: string) {
  const templates = generateContentTemplates(ctx);
  if (format === "BEFORE_AFTER") return templates.beforeAfterCaption;
  if (format === "TESTIMONIAL") return templates.testimonialCaption;
  if (format === "CASE_STUDY") return templates.caseStudyParagraph;
  if (format === "OTHER") return templates.referralProofCaption;
  return templates.facebookCompletedProject;
}
