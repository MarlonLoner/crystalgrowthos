import { Lead } from "@/lib/mock-data";

export type ScriptType =
  | "first-response"
  | "shopfront-logo-request"
  | "quote-follow-up"
  | "payment-reminder"
  | "design-approval"
  | "installation-scheduling"
  | "review-request"
  | "referral-request"
  | "dead-lead-revival";

export const scriptTypes: { value: ScriptType; label: string }[] = [
  { value: "first-response", label: "First response" },
  { value: "shopfront-logo-request", label: "Shopfront/logo request" },
  { value: "quote-follow-up", label: "Quote follow-up" },
  { value: "payment-reminder", label: "Payment reminder" },
  { value: "design-approval", label: "Design approval" },
  { value: "installation-scheduling", label: "Installation scheduling" },
  { value: "review-request", label: "Review request" },
  { value: "referral-request", label: "Referral request" },
  { value: "dead-lead-revival", label: "Dead lead revival" }
];

export function generateWhatsAppScript(type: ScriptType, lead: Pick<Lead, "name" | "businessName" | "serviceInterestedIn" | "status">) {
  const firstName = lead.name.split(" ")[0];
  const service = lead.serviceInterestedIn.toLowerCase();

  const scripts: Record<ScriptType, string> = {
    "first-response": `Hi ${firstName}, thanks for reaching out to Crystal Branding Studio. I saw you are interested in ${service} for ${lead.businessName}. Can I ask what date you want this ready so I guide you properly?`,
    "shopfront-logo-request": `Hi ${firstName}, to quote your ${service} neatly, please send your logo, shopfront photo, and rough size needed. Once I have those, I can advise the best finish and price range.`,
    "quote-follow-up": `Hi ${firstName}, just checking if you managed to go through the quote for ${lead.businessName}. If the figures look workable, we can secure materials and move you to artwork/production.`,
    "payment-reminder": `Hi ${firstName}, quick reminder on the deposit for ${lead.businessName}. Once payment reflects, we can lock the production slot and avoid delaying your ${service}.`,
    "design-approval": `Hi ${firstName}, the design is ready for your approval. Please confirm if the logo, colours, and wording are correct so we can proceed to production without delays.`,
    "installation-scheduling": `Hi ${firstName}, we are planning installation slots for this week. Which day works best for your team at ${lead.businessName} so we can schedule the ${service} neatly?`,
    "review-request": `Hi ${firstName}, thank you again for trusting Crystal Branding Studio. If you are happy with the work, please send us a short review or WhatsApp testimonial. It helps other businesses choose with confidence.`,
    "referral-request": `Hi ${firstName}, quick one: do you know another business that needs signage, banners, vinyl, or branding support? A referral from you would mean a lot, and we will look after them properly.`,
    "dead-lead-revival": `Hi ${firstName}, hope business is moving well. We had spoken about ${service} for ${lead.businessName}. Is this still something you want to revive this month, or should I follow up later?`
  };

  return scripts[type];
}

export function generateEmailScript(lead: Pick<Lead, "name" | "businessName" | "serviceInterestedIn" | "status">) {
  return `Subject: Next step for ${lead.businessName}\n\nHi ${lead.name},\n\nI wanted to follow up on your ${lead.serviceInterestedIn.toLowerCase()} request. The next best step is to confirm your preferred timeline and any artwork/logo files so Crystal Branding Studio can move this forward cleanly.\n\nKind regards,\nCrystal Branding Studio`;
}

