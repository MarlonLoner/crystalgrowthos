import type { Lead, Quote } from "@/lib/mock-data";
import type { ProductionJobView, ProofAssetView } from "@/lib/db-data";

export function proofTypeLabel(type: string) {
  return type.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function proofStatusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getProofSummary({
  lead,
  job,
  quote,
  proofAssets
}: {
  lead: Lead;
  job?: ProductionJobView | null;
  quote?: Quote | null;
  proofAssets: ProofAssetView[];
}) {
  const reviewRequested = proofAssets.some((asset) => asset.type === "REVIEW_REQUEST" && ["REQUESTED", "RECEIVED", "DRAFTED", "PUBLISHED"].includes(asset.status));
  const testimonialReceived = proofAssets.some((asset) => asset.type === "TESTIMONIAL" && ["RECEIVED", "DRAFTED", "PUBLISHED"].includes(asset.status));
  const beforeAfterExists = proofAssets.some((asset) => asset.type === "BEFORE_AFTER" && ["DRAFTED", "PUBLISHED", "RECEIVED"].includes(asset.status));
  const referralRequestSent = proofAssets.some((asset) => asset.type === "REFERRAL_REQUEST" && ["REQUESTED", "RECEIVED", "DRAFTED", "PUBLISHED"].includes(asset.status));
  const published = proofAssets.some((asset) => asset.status === "PUBLISHED");

  let proofStage = "To Request";
  let suggestedNextAction = "Request review and testimonial";
  if (reviewRequested) {
    proofStage = "Requested";
    suggestedNextAction = "Follow up for testimonial or photos";
  }
  if (testimonialReceived) {
    proofStage = "Received";
    suggestedNextAction = "Draft social proof post";
  }
  if (beforeAfterExists) {
    proofStage = "Drafted";
    suggestedNextAction = "Publish before/after content";
  }
  if (published) {
    proofStage = "Published";
    suggestedNextAction = "Ask for referral";
  }
  if (referralRequestSent && published) {
    suggestedNextAction = "Track referrals and archive when done";
  }

  const contentOpportunityScore = [
    job?.status === "COMPLETED" || job?.status === "REVIEW_REQUESTED",
    Boolean(quote),
    /sign|shopfront|vehicle|banner|vinyl|3d/i.test(`${lead.serviceInterestedIn} ${job?.title ?? ""}`),
    testimonialReceived,
    beforeAfterExists
  ].filter(Boolean).length * 20;

  return {
    proofStage,
    suggestedNextAction,
    reviewRequested,
    testimonialReceived,
    beforeAfterExists,
    referralRequestSent,
    contentOpportunityScore
  };
}
