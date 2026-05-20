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
  | "dead-lead-revival"
  | "request-missing-logo"
  | "request-shopfront-photo"
  | "confirm-assets-received"
  | "mockup-in-progress"
  | "mockup-ready"
  | "quote-after-mockup";

export const scriptTypes: { value: ScriptType; label: string }[] = [
  { value: "first-response", label: "First response" },
  { value: "shopfront-logo-request", label: "Shopfront/logo request" },
  { value: "quote-follow-up", label: "Quote follow-up" },
  { value: "payment-reminder", label: "Payment reminder" },
  { value: "design-approval", label: "Design approval" },
  { value: "installation-scheduling", label: "Installation scheduling" },
  { value: "review-request", label: "Review request" },
  { value: "referral-request", label: "Referral request" },
  { value: "dead-lead-revival", label: "Dead lead revival" },
  { value: "request-missing-logo", label: "Request missing logo" },
  { value: "request-shopfront-photo", label: "Request shopfront photo" },
  { value: "confirm-assets-received", label: "Confirm assets received" },
  { value: "mockup-in-progress", label: "Mockup in progress" },
  { value: "mockup-ready", label: "Mockup ready" },
  { value: "quote-after-mockup", label: "Quote after mockup" }
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
    "dead-lead-revival": `Hi ${firstName}, hope business is moving well. We had spoken about ${service} for ${lead.businessName}. Is this still something you want to revive this month, or should I follow up later?`,
    "request-missing-logo": `Hi ${firstName}, thanks for sending the shopfront details for ${lead.businessName}. Please send the logo file as well, preferably PNG, PDF, or clear image, so we can prepare a clean mockup.`,
    "request-shopfront-photo": `Hi ${firstName}, please send a clear front-facing photo of the shopfront for ${lead.businessName}. Once we have that, we can place the branding idea properly.`,
    "confirm-assets-received": `Hi ${firstName}, we received the shopfront assets for ${lead.businessName}. The next step is preparing the mockup direction and checking what will work best for visibility.`,
    "mockup-in-progress": `Hi ${firstName}, your shopfront mockup for ${lead.businessName} is in progress. We are checking layout, logo placement, and what will make the brand stand out clearly.`,
    "mockup-ready": `Hi ${firstName}, your shopfront mockup for ${lead.businessName} is ready. Can I send it through for review and then prepare the quote for production?`,
    "quote-after-mockup": `Hi ${firstName}, based on the mockup for ${lead.businessName}, the next step is a quote for production and installation. Should I prepare the pricing options for you?`
  };

  return scripts[type];
}

export function generateEmailScript(lead: Pick<Lead, "name" | "businessName" | "serviceInterestedIn" | "status">) {
  return `Subject: Next step for ${lead.businessName}\n\nHi ${lead.name},\n\nI wanted to follow up on your ${lead.serviceInterestedIn.toLowerCase()} request. The next best step is to confirm your preferred timeline and any artwork/logo files so Crystal Branding Studio can move this forward cleanly.\n\nKind regards,\nCrystal Branding Studio`;
}


