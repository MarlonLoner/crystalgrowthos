"use server";

import { FollowUpActivityType, LeadStatus, PaymentMethod, Prisma, ProductionPriority, ProductionStatus, ProofAssetType, ProofStatus, QuoteStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateProofContentDrafts } from "@/lib/proof-content";

const leadStatusMap: Record<string, LeadStatus> = {
  "New Lead": LeadStatus.NEW_LEAD,
  Contacted: LeadStatus.CONTACTED,
  "Quote Requested": LeadStatus.QUOTE_REQUESTED,
  "Quote Sent": LeadStatus.QUOTE_SENT,
  "Follow-Up Needed": LeadStatus.FOLLOW_UP_NEEDED,
  Negotiating: LeadStatus.NEGOTIATING,
  Won: LeadStatus.WON,
  Lost: LeadStatus.LOST
};

function optionalDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text ? new Date(text) : null;
}

function requiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function money(formData: FormData, key: string) {
  return String(formData.get(key) || "0");
}

function tomorrow() {
  const value = new Date();
  value.setDate(value.getDate() + 1);
  return value;
}

function quoteNumberFromDemoId(quoteId: string) {
  const match = quoteId.match(/^quote-(\d+)$/);
  if (!match) return null;
  return `CBS-2026-${match[1].padStart(3, "0")}`;
}

async function findQuoteForAction(quoteId: string) {
  const byId = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { lead: true }
  });
  if (byId) return byId;

  const quoteNumber = quoteNumberFromDemoId(quoteId) ?? (quoteId.startsWith("CBS-") ? quoteId : null);
  if (!quoteNumber) return null;

  return prisma.quote.findUnique({
    where: { quoteNumber },
    include: { lead: true }
  });
}

function revalidateSalesRoutes(inputQuoteId?: string, leadId?: string, resolvedQuoteId?: string) {
  ["/", "/leads", "/follow-ups", "/money-today", "/quotes", "/reports/revenue"].forEach((path) => revalidatePath(path));
  if (leadId) revalidatePath(`/leads/${leadId}`);
  if (inputQuoteId) {
    revalidatePath(`/quotes/${inputQuoteId}`);
    revalidatePath(`/quotes/${inputQuoteId}/print`);
  }
  if (resolvedQuoteId && resolvedQuoteId !== inputQuoteId) {
    revalidatePath(`/quotes/${resolvedQuoteId}`);
    revalidatePath(`/quotes/${resolvedQuoteId}/print`);
  }
}

export async function createLeadAction(formData: FormData) {
  const lead = await prisma.lead.create({
    data: {
      name: requiredString(formData, "name"),
      phone: requiredString(formData, "phone"),
      email: requiredString(formData, "email"),
      businessName: requiredString(formData, "businessName"),
      businessType: requiredString(formData, "businessType"),
      source: requiredString(formData, "source"),
      serviceInterestedIn: requiredString(formData, "serviceInterestedIn"),
      status: leadStatusMap[requiredString(formData, "status")] ?? LeadStatus.NEW_LEAD,
      dealValue: money(formData, "dealValue"),
      estimatedDealValue: money(formData, "estimatedDealValue"),
      birthday: optionalDate(formData.get("birthday")),
      notes: requiredString(formData, "notes"),
      lastContactedAt: optionalDate(formData.get("lastContactedAt")),
      nextFollowUpDate: optionalDate(formData.get("nextFollowUpDate")),
      nextFollowUpAt: optionalDate(formData.get("nextFollowUpDate"))
    }
  });

  revalidateSalesRoutes(undefined, lead.id);
  redirect(`/leads/${lead.id}`);
}

export async function updateLeadAction(formData: FormData) {
  const id = requiredString(formData, "id");
  await prisma.lead.update({
    where: { id },
    data: {
      name: requiredString(formData, "name"),
      phone: requiredString(formData, "phone"),
      email: requiredString(formData, "email"),
      businessName: requiredString(formData, "businessName"),
      businessType: requiredString(formData, "businessType"),
      source: requiredString(formData, "source"),
      serviceInterestedIn: requiredString(formData, "serviceInterestedIn"),
      status: leadStatusMap[requiredString(formData, "status")] ?? LeadStatus.NEW_LEAD,
      dealValue: money(formData, "dealValue"),
      estimatedDealValue: money(formData, "estimatedDealValue"),
      birthday: optionalDate(formData.get("birthday")),
      notes: requiredString(formData, "notes"),
      lastContactedAt: optionalDate(formData.get("lastContactedAt")),
      nextFollowUpDate: optionalDate(formData.get("nextFollowUpDate")),
      nextFollowUpAt: optionalDate(formData.get("nextFollowUpDate"))
    }
  });

  revalidateSalesRoutes(undefined, id);
  redirect(`/leads/${id}`);
}

export async function markLeadContactedAction(leadId: string) {
  const now = new Date();
  const next = tomorrow();

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      lastContactedAt: now,
      nextFollowUpAt: next,
      nextFollowUpDate: next,
      activities: {
        create: {
          type: FollowUpActivityType.NOTE,
          title: "Lead contacted",
          note: "Lead was marked as contacted from Crystal Growth OS",
          completedAt: now
        }
      }
    }
  });

  revalidateSalesRoutes(undefined, leadId);
  return { ok: true, message: "Lead marked as contacted" };
}

export async function completeFollowUpActivityAction(input: { leadId: string; activityId?: string; note?: string }) {
  const now = new Date();
  let completedActivity: { leadId: string; title: string; note: string | null } | null = null;

  if (input.activityId) {
    completedActivity = await prisma.followUpActivity.update({
      where: { id: input.activityId },
      data: { completedAt: now },
      select: { leadId: true, title: true, note: true }
    });
  } else {
    completedActivity = await prisma.followUpActivity.create({
      data: {
        leadId: input.leadId,
        type: FollowUpActivityType.NOTE,
        title: "Follow-up completed",
        note: input.note ?? "Follow-up was marked done from Crystal Growth OS",
        completedAt: now
      },
      select: { leadId: true, title: true, note: true }
    });
  }

  if (completedActivity) {
    await syncProofFromCompletedActivity(completedActivity);
  }

  revalidateSalesRoutes(undefined, input.leadId);
  revalidatePath("/proof");
  revalidatePath("/production");
  return { ok: true, message: "Follow-up marked done" };
}

function normalizeEmail(value: FormDataEntryValue | string | null | undefined) {
  const email = String(value ?? "").trim().toLowerCase();
  return email || null;
}

async function findLeadByEmail(email: string) {
  return prisma.lead.findUnique({ where: { email } });
}

function appendLeadNote(existingNotes: string | null | undefined, newNote: string) {
  return [existingNotes?.trim(), newNote.trim()].filter(Boolean).join("\n\n");
}

function submissionTimestamp() {
  return new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function buildRepeatSubmissionNote({
  title,
  budgetRange,
  urgency,
  source,
  notes,
  preferredStyle,
  deadline
}: {
  title: string;
  budgetRange?: string;
  urgency?: string;
  source?: string;
  notes?: string;
  preferredStyle?: string;
  deadline?: string;
}) {
  return [
    `${title} received on ${submissionTimestamp()}`,
    source ? `Source: ${source}` : "",
    preferredStyle ? `Preferred style: ${preferredStyle}` : "",
    deadline ? `Deadline: ${deadline}` : "",
    budgetRange ? `Budget range: ${budgetRange}` : "",
    urgency ? `Urgency: ${urgency}` : "",
    notes ? `Submitted notes: ${notes}` : ""
  ].filter(Boolean).join("\n");
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function createLeadAssetsForLead(leadId: string, assets: IntakeAssetInput[]) {
  const data = assetCreateData(assets).map((asset) => ({ ...asset, leadId }));
  if (!data.length) return [];

  return Promise.all(data.map((asset) => prisma.leadAsset.create({ data: asset })));
}

async function createFirstResponseActivity(leadId: string, title: string, note: string, dueAt = new Date()) {
  return prisma.followUpActivity.create({
    data: {
      leadId,
      type: FollowUpActivityType.WHATSAPP,
      title,
      note,
      dueAt,
      completedAt: null
    }
  });
}

async function createMockupReviewActivity(leadId: string, note: string, dueAt = tomorrow()) {
  return prisma.followUpActivity.create({
    data: {
      leadId,
      type: FollowUpActivityType.NOTE,
      title: "Review updated mockup assets",
      note,
      dueAt,
      completedAt: null
    }
  });
}
function budgetEstimate(value: string) {
  const text = value.toLowerCase();
  if (text.includes("2000") || text.includes("5000")) return "2500";
  if (text.includes("1000")) return "1200";
  if (text.includes("500")) return "650";
  if (text.includes("300")) return "350";
  return "0";
}

function requireIntakeFields(formData: FormData, fields: string[]) {
  const missing = fields.filter((field) => !requiredString(formData, field));
  if (missing.length) {
    throw new Error(`Missing required intake fields: ${missing.join(", ")}`);
  }
}

const allowedLeadAssetTypes = ["SHOPFRONT_IMAGE", "LOGO", "REFERENCE_IMAGE", "OTHER"] as const;

type SafeLeadAssetType = (typeof allowedLeadAssetTypes)[number];

function normalizeLeadAssetType(value: unknown): SafeLeadAssetType {
  return allowedLeadAssetTypes.includes(value as SafeLeadAssetType) ? (value as SafeLeadAssetType) : "OTHER";
}

type IntakeAssetInput = {
  type: SafeLeadAssetType | string;
  url: string;
  pathname?: string;
  filename?: string;
  contentType?: string;
  size?: number;
  notes?: string;
};

function parseUploadedAssets(formData: FormData) {
  const assets: IntakeAssetInput[] = [];
  const raw = requiredString(formData, "assetsJson");

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as IntakeAssetInput[];
      if (Array.isArray(parsed)) assets.push(...parsed.filter((asset) => asset.url && asset.type));
    } catch {
      console.error("[intake-assets] Could not parse uploaded asset metadata");
    }
  }

  const fallbackAssets: Array<{ key: string; type: SafeLeadAssetType; label: string }> = [
    { key: "shopfrontImageUrl", type: "SHOPFRONT_IMAGE", label: "Shopfront image URL fallback" },
    { key: "logoUrl", type: "LOGO", label: "Logo URL fallback" },
    { key: "referenceImageUrl", type: "REFERENCE_IMAGE", label: "Reference image URL fallback" }
  ];

  fallbackAssets.forEach(({ key, type, label }) => {
    const url = requiredString(formData, key);
    if (!url || assets.some((asset) => asset.type === type)) return;
    assets.push({
      type,
      url,
      pathname: url,
      filename: url.split("/").pop() || label,
      contentType: "text/uri-list",
      size: 0,
      notes: label
    });
  });

  return assets;
}

function assetCreateData(assets: IntakeAssetInput[]) {
  return assets.map((asset) => ({
    type: normalizeLeadAssetType(asset.type),
    url: asset.url,
    pathname: asset.pathname ?? asset.url,
    filename: asset.filename ?? "uploaded-asset",
    contentType: asset.contentType ?? "application/octet-stream",
    size: Number(asset.size ?? 0),
    notes: asset.notes ?? null
  }));
}

function hasAsset(assets: IntakeAssetInput[], type: SafeLeadAssetType) {
  return assets.some((asset) => asset.type === type && asset.url);
}
function revalidateIntakeRoutes(leadId?: string) {
  ["/", "/leads", "/follow-ups", "/money-today", "/intake/inbox", "/reports/revenue"].forEach((path) => revalidatePath(path));
  if (leadId) revalidatePath(`/leads/${leadId}`);
}

async function attachRepeatIntakeSubmission(formData: FormData, email: string) {
  const existing = await findLeadByEmail(email);
  if (!existing) throw new Error("Existing lead not found for repeat intake submission");

  const now = new Date();
  const budgetRange = requiredString(formData, "budgetRange");
  const urgency = requiredString(formData, "urgency");
  const source = requiredString(formData, "source") || "Website intake";
  const submittedNotes = requiredString(formData, "notes");
  const repeatNote = buildRepeatSubmissionNote({
    title: "Repeat intake submission",
    budgetRange,
    urgency,
    source,
    notes: submittedNotes
  });

  return prisma.lead.update({
    where: { id: existing.id },
    data: {
      phone: requiredString(formData, "phone") || existing.phone,
      businessName: requiredString(formData, "businessName") || existing.businessName,
      businessType: requiredString(formData, "businessType") || existing.businessType,
      serviceInterestedIn: requiredString(formData, "serviceInterestedIn") || existing.serviceInterestedIn,
      source,
      status: existing.status === LeadStatus.LOST ? LeadStatus.FOLLOW_UP_NEEDED : existing.status,
      notes: appendLeadNote(existing.notes, repeatNote),
      nextFollowUpAt: now,
      nextFollowUpDate: now,
      activities: {
        create: {
          type: FollowUpActivityType.WHATSAPP,
          title: "Repeat intake submission",
          note: "This prospect submitted another intake request through Crystal Growth OS.",
          dueAt: now,
          completedAt: null
        }
      }
    }
  });
}

export async function createIntakeLeadAction(formData: FormData) {
  requireIntakeFields(formData, ["name", "phone", "email", "businessName", "serviceInterestedIn"]);

  const email = normalizeEmail(formData.get("email"));
  if (!email) throw new Error("A valid email is required for intake submissions.");

  const existingLead = await findLeadByEmail(email);
  if (existingLead) {
    const updated = await attachRepeatIntakeSubmission(formData, email);
    revalidateIntakeRoutes(updated.id);
    redirect("/intake/thank-you");
  }

  const budgetRange = requiredString(formData, "budgetRange");
  const urgency = requiredString(formData, "urgency");
  const source = requiredString(formData, "source") || "Website intake";
  const notes = [
    "Website intake request",
    `Budget range: ${budgetRange || "Not provided"}`,
    `Urgency: ${urgency || "Not provided"}`,
    requiredString(formData, "notes") ? `Prospect notes: ${requiredString(formData, "notes")}` : ""
  ].filter(Boolean).join("\n");

  try {
    const lead = await prisma.lead.create({
      data: {
        name: requiredString(formData, "name"),
        phone: requiredString(formData, "phone"),
        email,
        businessName: requiredString(formData, "businessName"),
        businessType: requiredString(formData, "businessType") || "Not specified",
        source,
        serviceInterestedIn: requiredString(formData, "serviceInterestedIn"),
        status: LeadStatus.NEW_LEAD,
        dealValue: budgetEstimate(budgetRange),
        estimatedDealValue: budgetEstimate(budgetRange),
        notes,
        lastContactedAt: null,
        nextFollowUpAt: new Date(),
        nextFollowUpDate: new Date(),
        activities: {
          create: {
            type: FollowUpActivityType.WHATSAPP,
            title: "New lead first response",
            note: `Send first response for ${requiredString(formData, "serviceInterestedIn")}. Urgency: ${urgency || "Not provided"}. Budget: ${budgetRange || "Not provided"}.`,
            dueAt: new Date(),
            completedAt: null
          }
        }
      }
    });

    revalidateIntakeRoutes(lead.id);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const updated = await attachRepeatIntakeSubmission(formData, email);
      revalidateIntakeRoutes(updated.id);
    } else {
      throw error;
    }
  }

  redirect("/intake/thank-you");
}

type ShopfrontSubmissionResult = {
  leadId: string;
  createdAssetIds: string[];
  createdActivityIds: string[];
};

function shopfrontAssetSummary(assets: IntakeAssetInput[]) {
  const hasShopfront = hasAsset(assets, "SHOPFRONT_IMAGE");
  const hasLogo = hasAsset(assets, "LOGO");
  const hasReference = hasAsset(assets, "REFERENCE_IMAGE");
  return {
    hasShopfront,
    hasLogo,
    hasReference,
    text: `Assets attached: ${assets.length}. Shopfront: ${hasShopfront ? "yes" : "missing"}. Logo: ${hasLogo ? "yes" : "missing"}. Reference: ${hasReference ? "yes" : "missing"}.`
  };
}

async function createShopfrontActivities({
  leadId,
  isRepeat,
  serviceInterestedIn,
  urgency,
  assetSummary,
  designNotes,
  now,
  next
}: {
  leadId: string;
  isRepeat: boolean;
  serviceInterestedIn: string;
  urgency: string;
  assetSummary: string;
  designNotes: string;
  now: Date;
  next: Date;
}) {
  const firstActivity = await prisma.followUpActivity.create({
    data: {
      leadId,
      type: FollowUpActivityType.WHATSAPP,
      title: isRepeat ? "Repeat shopfront mockup request" : "New shopfront mockup request",
      note: isRepeat
        ? assetSummary
        : `Service: ${serviceInterestedIn}. Urgency: ${urgency || "Not provided"}. ${assetSummary}`,
      dueAt: now,
      completedAt: null
    },
    select: { id: true, title: true, type: true, dueAt: true }
  });

  const reviewActivity = await prisma.followUpActivity.create({
    data: {
      leadId,
      type: FollowUpActivityType.NOTE,
      title: isRepeat ? "Review updated mockup assets" : "Prepare shopfront mockup",
      note: isRepeat
        ? "A returning prospect submitted new or updated mockup assets."
        : `${assetSummary} Design notes: ${designNotes || "No extra notes provided"}.`,
      dueAt: next,
      completedAt: null
    },
    select: { id: true, title: true, type: true, dueAt: true }
  });

  return [firstActivity, reviewActivity];
}

async function attachRepeatShopfrontSubmission(formData: FormData, email: string, assets: IntakeAssetInput[]): Promise<ShopfrontSubmissionResult> {
  const existing = await findLeadByEmail(email);
  if (!existing) throw new Error("Existing lead not found for repeat shopfront submission");

  const now = new Date();
  const next = tomorrow();
  const budgetRange = requiredString(formData, "budgetRange");
  const urgency = requiredString(formData, "urgency");
  const preferredStyle = requiredString(formData, "preferredStyle");
  const deadline = requiredString(formData, "deadline");
  const source = requiredString(formData, "source") || "Shopfront mockup form";
  const serviceInterestedIn = requiredString(formData, "serviceInterestedIn") || "Shopfront branding mockup";
  const submittedNotes = requiredString(formData, "notes");
  const assetSummary = shopfrontAssetSummary(assets).text;
  const repeatNote = buildRepeatSubmissionNote({
    title: "Repeat shopfront mockup request",
    budgetRange,
    urgency,
    source,
    notes: submittedNotes,
    preferredStyle,
    deadline
  });

  console.log("[shopfront-intake] updating existing lead", { existingLeadId: existing.id, email });
  const updated = await prisma.lead.update({
    where: { id: existing.id },
    data: {
      phone: requiredString(formData, "phone") || existing.phone,
      businessName: requiredString(formData, "businessName") || existing.businessName,
      businessType: requiredString(formData, "businessType") || existing.businessType,
      serviceInterestedIn,
      source,
      status: existing.status === LeadStatus.LOST ? LeadStatus.FOLLOW_UP_NEEDED : existing.status,
      notes: appendLeadNote(existing.notes, [repeatNote, assetSummary].join("\n")),
      nextFollowUpAt: now,
      nextFollowUpDate: now
    },
    select: { id: true, status: true, source: true, nextFollowUpAt: true, nextFollowUpDate: true }
  });
  console.log("[shopfront-intake] updated existing lead result", updated);

  const createdAssets = await createLeadAssetsForLead(existing.id, assets);
  console.log("[shopfront-intake] created asset ids/count", { count: createdAssets.length, ids: createdAssets.map((asset) => asset.id) });

  const createdActivities = await createShopfrontActivities({
    leadId: existing.id,
    isRepeat: true,
    serviceInterestedIn,
    urgency,
    assetSummary,
    designNotes: submittedNotes || preferredStyle,
    now,
    next
  });
  console.log("[shopfront-intake] created follow-up activity ids", createdActivities.map((activity) => activity.id));

  return {
    leadId: existing.id,
    createdAssetIds: createdAssets.map((asset) => asset.id),
    createdActivityIds: createdActivities.map((activity) => activity.id)
  };
}

export async function createShopfrontIntakeLeadAction(formData: FormData) {
  console.log("[shopfront-intake] action started");
  requireIntakeFields(formData, ["name", "phone", "email", "businessName"]);

  const email = normalizeEmail(formData.get("email"));
  console.log("[shopfront-intake] normalized email", email);
  if (!email) throw new Error("A valid email is required for shopfront mockup requests.");

  const assets = parseUploadedAssets(formData);
  const createAssets = assetCreateData(assets);
  console.log("[shopfront-intake] uploaded asset payload received", {
    rawAssetsJsonLength: requiredString(formData, "assetsJson").length,
    parsedAssetCount: assets.length,
    assetTypes: assets.map((asset) => asset.type),
    assetCreateDataCount: createAssets.length
  });

  let result: ShopfrontSubmissionResult | null = null;

  try {
    const existingLead = await findLeadByEmail(email);
    console.log("[shopfront-intake] existing lead found", existingLead ? { id: existingLead.id, status: existingLead.status, source: existingLead.source } : null);

    if (existingLead) {
      console.log("[shopfront-intake] path", "updating existing lead");
      result = await attachRepeatShopfrontSubmission(formData, email, assets);
    } else {
      console.log("[shopfront-intake] path", "creating new lead");
      const budgetRange = requiredString(formData, "budgetRange");
      const urgency = requiredString(formData, "urgency");
      const shopfrontImageUrl = requiredString(formData, "shopfrontImageUrl");
      const logoUrl = requiredString(formData, "logoUrl");
      const referenceImageUrl = requiredString(formData, "referenceImageUrl");
      const preferredStyle = requiredString(formData, "preferredStyle");
      const deadline = requiredString(formData, "deadline");
      const source = requiredString(formData, "source") || "Shopfront mockup form";
      const serviceInterestedIn = requiredString(formData, "serviceInterestedIn") || "Shopfront branding mockup";
      const now = new Date();
      const next = tomorrow();
      const summary = shopfrontAssetSummary(assets);
      const submittedNotes = requiredString(formData, "notes");
      const notes = [
        "Shopfront mockup request",
        `Preferred style: ${preferredStyle || "Not provided"}`,
        `Deadline: ${deadline || "Not provided"}`,
        `Budget range: ${budgetRange || "Not provided"}`,
        `Urgency: ${urgency || "Not provided"}`,
        summary.text,
        shopfrontImageUrl ? `Shopfront image URL: ${shopfrontImageUrl}` : "Shopfront image URL: Not provided",
        logoUrl ? `Logo URL: ${logoUrl}` : "Logo URL: Not provided",
        referenceImageUrl ? `Reference image URL: ${referenceImageUrl}` : "Reference image URL: Not provided",
        submittedNotes ? `Prospect notes: ${submittedNotes}` : ""
      ].filter(Boolean).join("\n");

      const lead = await prisma.lead.create({
        data: {
          name: requiredString(formData, "name"),
          phone: requiredString(formData, "phone"),
          email,
          businessName: requiredString(formData, "businessName"),
          businessType: requiredString(formData, "businessType") || "Retail / shopfront",
          source,
          serviceInterestedIn,
          status: LeadStatus.NEW_LEAD,
          dealValue: budgetEstimate(budgetRange),
          estimatedDealValue: budgetEstimate(budgetRange),
          notes,
          lastContactedAt: null,
          nextFollowUpAt: now,
          nextFollowUpDate: now
        },
        select: { id: true, email: true, source: true, status: true, nextFollowUpAt: true, nextFollowUpDate: true }
      });
      console.log("[shopfront-intake] lead id after create/update", lead);

      const createdAssets = await createLeadAssetsForLead(lead.id, assets);
      console.log("[shopfront-intake] created asset ids/count", { count: createdAssets.length, ids: createdAssets.map((asset) => asset.id) });

      const createdActivities = await createShopfrontActivities({
        leadId: lead.id,
        isRepeat: false,
        serviceInterestedIn,
        urgency,
        assetSummary: summary.text,
        designNotes: submittedNotes || preferredStyle,
        now,
        next
      });
      console.log("[shopfront-intake] created follow-up activity ids", createdActivities.map((activity) => activity.id));

      result = {
        leadId: lead.id,
        createdAssetIds: createdAssets.map((asset) => asset.id),
        createdActivityIds: createdActivities.map((activity) => activity.id)
      };
    }
  } catch (error) {
    console.error("[shopfront-intake] caught error", error);

    if (isUniqueConstraintError(error)) {
      console.log("[shopfront-intake] P2002 detected, attaching submission to existing lead", { email });
      result = await attachRepeatShopfrontSubmission(formData, email, assets);
    } else {
      throw new Error("We could not save your shopfront mockup request. Please try again or WhatsApp Crystal Branding Studio.");
    }
  }

  if (!result?.leadId) {
    console.error("[shopfront-intake] no lead id after create/update", result);
    throw new Error("We could not save your shopfront mockup request. Please try again or WhatsApp Crystal Branding Studio.");
  }

  console.log("[shopfront-intake] lead id after create/update", result.leadId);
  console.log("[shopfront-intake] asset create data count", createAssets.length);
  console.log("[shopfront-intake] final created asset ids/count", { count: result.createdAssetIds.length, ids: result.createdAssetIds });
  console.log("[shopfront-intake] final created follow-up activity ids", result.createdActivityIds);

  revalidateIntakeRoutes(result.leadId);
  console.log("[shopfront-intake] redirect target", "/intake/thank-you");
  redirect("/intake/thank-you");
}
function revalidateMockupRoutes(leadId: string) {
  ["/", "/mockups", "/leads", "/follow-ups", "/money-today", "/intake/inbox", "/reports/revenue"].forEach((path) => revalidatePath(path));
  revalidatePath(`/leads/${leadId}`);
}

async function ensureLeadForMockupAction(leadId: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true, status: true } });
  if (!lead) throw new Error(`Lead not found: ${leadId}`);
  return lead;
}

export async function markMockupInDesignAction(leadId: string) {
  await ensureLeadForMockupAction(leadId);
  const now = new Date();
  const next = tomorrow();
  const activity = await prisma.followUpActivity.create({
    data: {
      leadId,
      type: FollowUpActivityType.NOTE,
      title: "Mockup in design",
      note: "Shopfront mockup has been moved into design.",
      completedAt: now
    },
    select: { id: true }
  });
  const internalTask = await prisma.followUpActivity.create({
    data: {
      leadId,
      type: FollowUpActivityType.NOTE,
      title: "Prepare and send mockup",
      note: "Prepare the shopfront mockup and send it to the client.",
      dueAt: next,
      completedAt: null
    },
    select: { id: true }
  });
  revalidateMockupRoutes(leadId);
  return { ok: true, message: "Mockup moved into design and internal task created", activityId: activity.id, internalTaskId: internalTask.id };
}

export async function markMockupSentAction(leadId: string) {
  await ensureLeadForMockupAction(leadId);
  const now = new Date();
  const next = tomorrow();

  console.log("[mockup-workflow] markMockupSentAction", { leadId });
  const prepareTasks = await prisma.followUpActivity.findMany({
    where: {
      leadId,
      title: { contains: "Prepare and send mockup", mode: "insensitive" },
      completedAt: null
    },
    select: { id: true, title: true }
  });
  console.log("[mockup-workflow] pending prepare tasks found", { leadId, count: prepareTasks.length, ids: prepareTasks.map((task) => task.id) });

  const completedInternalTasks = await prisma.followUpActivity.updateMany({
    where: {
      leadId,
      id: { in: prepareTasks.map((task) => task.id) },
      completedAt: null
    },
    data: { completedAt: now }
  });
  console.log("[mockup-workflow] prepare tasks completed", { leadId, count: completedInternalTasks.count });

  const sent = await prisma.followUpActivity.create({
    data: {
      leadId,
      type: FollowUpActivityType.WHATSAPP,
      title: "Mockup sent",
      note: "Mockup was sent to the prospect.",
      completedAt: now
    },
    select: { id: true }
  });
  console.log("[mockup-workflow] created mockup sent activity", { leadId, activityId: sent.id });

  const followUp = await prisma.followUpActivity.create({
    data: {
      leadId,
      type: FollowUpActivityType.WHATSAPP,
      title: "Follow up on mockup",
      note: "Check if the client likes the mockup and wants a quote.",
      dueAt: next,
      completedAt: null
    },
    select: { id: true }
  });
  console.log("[mockup-workflow] created mockup follow-up activity", { leadId, activityId: followUp.id });

  await prisma.lead.update({ where: { id: leadId }, data: { nextFollowUpAt: next, nextFollowUpDate: next } });
  revalidateMockupRoutes(leadId);
  return {
    ok: true,
    message: "Mockup sent, internal task completed, and follow-up scheduled",
    activityId: sent.id,
    followUpActivityId: followUp.id,
    completedInternalTaskCount: completedInternalTasks.count
  };
}
export async function markReadyForQuoteAction(leadId: string) {
  const lead = await ensureLeadForMockupAction(leadId);
  const now = new Date();
  const activity = await prisma.followUpActivity.create({
    data: { leadId, type: FollowUpActivityType.NOTE, title: "Ready for quote", note: "Client is ready for quote after mockup.", completedAt: now },
    select: { id: true }
  });
  if (lead.status !== LeadStatus.WON && lead.status !== LeadStatus.LOST) {
    await prisma.lead.update({ where: { id: leadId }, data: { status: LeadStatus.QUOTE_REQUESTED, nextFollowUpAt: now, nextFollowUpDate: now } });
  }
  revalidateMockupRoutes(leadId);
  return { ok: true, message: "Lead marked ready for quote", activityId: activity.id };
}

export async function requestMissingAssetsAction(leadId: string) {
  await ensureLeadForMockupAction(leadId);
  const now = new Date();
  const next = tomorrow();
  const requested = await prisma.followUpActivity.create({
    data: { leadId, type: FollowUpActivityType.WHATSAPP, title: "Requested missing assets", note: "Asked prospect to send missing logo/shopfront photo.", completedAt: now },
    select: { id: true }
  });
  const followUp = await prisma.followUpActivity.create({
    data: { leadId, type: FollowUpActivityType.WHATSAPP, title: "Follow up on missing assets", note: "Check if the prospect has sent the missing logo or shopfront photo.", dueAt: next, completedAt: null },
    select: { id: true }
  });
  await prisma.lead.update({ where: { id: leadId }, data: { nextFollowUpAt: next, nextFollowUpDate: next } });
  revalidateMockupRoutes(leadId);
  return { ok: true, message: "Missing assets request logged", activityId: requested.id, followUpActivityId: followUp.id };
}
function quoteStatusFromLabel(value: string) {
  const normalized = value.trim().toUpperCase().replaceAll(" ", "_").replaceAll("-", "_");
  return (QuoteStatus as Record<string, QuoteStatus>)[normalized] ?? QuoteStatus.DRAFT;
}

async function nextQuoteNumberForAction(fallback?: string) {
  if (fallback?.trim()) return fallback.trim();
  const year = new Date().getFullYear();
  const count = await prisma.quote.count();
  return `CBS-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function createQuoteAction(formData: FormData) {
  const leadId = requiredString(formData, "leadId");
  if (!leadId) throw new Error("A lead is required to create a quote.");

  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true, status: true } });
  if (!lead) throw new Error(`Lead not found: ${leadId}`);

  const descriptions = formData.getAll("lineDescription").map((value) => String(value).trim());
  const quantities = formData.getAll("lineQuantity").map((value) => Number(value || 0));
  const unitPrices = formData.getAll("lineUnitPrice").map((value) => Number(value || 0));
  const lineItems = descriptions
    .map((description, index) => ({
      description,
      quantity: Number.isFinite(quantities[index]) && quantities[index] > 0 ? quantities[index] : 1,
      unitPrice: Number.isFinite(unitPrices[index]) ? unitPrices[index] : 0
    }))
    .filter((item) => item.description);

  if (!lineItems.length) throw new Error("At least one quote line item is required.");

  const discount = Number(requiredString(formData, "discount") || 0);
  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const finalTotal = Math.max(total - (Number.isFinite(discount) ? discount : 0), 0);
  const quoteNumber = await nextQuoteNumberForAction(requiredString(formData, "quoteNumber"));
  const status = quoteStatusFromLabel(requiredString(formData, "status"));
  const now = new Date();

  const quote = await prisma.quote.create({
    data: {
      leadId,
      quoteNumber,
      clientName: requiredString(formData, "clientName"),
      businessName: requiredString(formData, "businessName"),
      serviceCategory: requiredString(formData, "serviceCategory"),
      status,
      discount: String(Number.isFinite(discount) ? discount : 0),
      total: String(total),
      finalTotal: String(finalTotal),
      notes: requiredString(formData, "notes"),
      terms: requiredString(formData, "terms"),
      expiryDate: optionalDate(formData.get("expiryDate")) ?? tomorrow(),
      lineItems: {
        create: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          total: String(item.quantity * item.unitPrice)
        }))
      }
    },
    select: { id: true, leadId: true, quoteNumber: true }
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: status === QuoteStatus.SENT ? LeadStatus.QUOTE_SENT : LeadStatus.QUOTE_REQUESTED,
      nextFollowUpAt: now,
      nextFollowUpDate: now,
      activities: {
        create: {
          type: FollowUpActivityType.QUOTE_CREATED,
          title: "Quote created from lead",
          note: "Quote was created from lead/mockup workflow.",
          completedAt: now
        }
      }
    }
  });

  revalidateSalesRoutes(quote.id, leadId);
  revalidatePath("/mockups");
  revalidatePath("/money-today");
  revalidatePath("/reports/revenue");
  redirect(`/quotes/${quote.id}`);
}
const proofStatusRank: Record<ProofStatus, number> = {
  TODO: 0,
  REQUESTED: 1,
  RECEIVED: 2,
  DRAFTED: 3,
  PUBLISHED: 4,
  ARCHIVED: 5
};

function nextProofStatus(current: ProofStatus, requested?: ProofStatus) {
  if (!requested) return current;
  return proofStatusRank[requested] >= proofStatusRank[current] ? requested : current;
}

async function ensurePendingFollowUp(leadId: string, title: string, note: string, type: FollowUpActivityType, dueAt: Date) {
  const existing = await prisma.followUpActivity.findFirst({
    where: { leadId, title, completedAt: null }
  });
  if (existing) return existing;
  return prisma.followUpActivity.create({ data: { leadId, type, title, note, dueAt, completedAt: null } });
}

async function ensureCompletedActivity(leadId: string, title: string, note: string, type: FollowUpActivityType) {
  const existing = await prisma.followUpActivity.findFirst({
    where: { leadId, title, completedAt: { not: null } },
    orderBy: { createdAt: "desc" }
  });
  if (existing) return existing;
  return prisma.followUpActivity.create({ data: { leadId, type, title, note, completedAt: new Date() } });
}
type EnsureProofAssetInput = {
  leadId: string;
  quoteId?: string | null;
  productionJobId?: string | null;
  type: ProofAssetType;
  title: string;
  content?: string | null;
  status?: ProofStatus;
};

async function ensureProofAssetForJob(input: EnsureProofAssetInput) {
  const existing = await prisma.proofAsset.findFirst({
    where: input.productionJobId
      ? { productionJobId: input.productionJobId, type: input.type }
      : { leadId: input.leadId, quoteId: input.quoteId ?? null, productionJobId: null, type: input.type }
  });

  if (existing) {
    return prisma.proofAsset.update({
      where: { id: existing.id },
      data: {
        title: input.title || existing.title,
        content: input.content ?? existing.content,
        quoteId: input.quoteId ?? existing.quoteId,
        productionJobId: input.productionJobId ?? existing.productionJobId,
        status: nextProofStatus(existing.status, input.status)
      }
    });
  }

  return prisma.proofAsset.create({
    data: {
      leadId: input.leadId,
      quoteId: input.quoteId ?? null,
      productionJobId: input.productionJobId ?? null,
      type: input.type,
      title: input.title,
      content: input.content ?? null,
      status: input.status ?? ProofStatus.TODO
    }
  });
}

async function ensureDefaultProofAssetsForCompletedJob(productionJobId: string) {
  const job = await prisma.productionJob.findUnique({ where: { id: productionJobId }, include: { quote: true, lead: true } });
  if (!job) throw new Error(`Production job not found: ${productionJobId}`);

  const templates = [
    { type: ProofAssetType.REVIEW_REQUEST, title: "Request client review", content: "Ask client for a Google review or WhatsApp testimonial." },
    { type: ProofAssetType.BEFORE_AFTER, title: "Create before/after content", content: "Use completed work as marketing content." },
    { type: ProofAssetType.REFERRAL_REQUEST, title: "Ask for referral", content: "Ask the happy client to refer another business." }
  ];

  const proofAssets = [];
  for (const template of templates) {
    proofAssets.push(await ensureProofAssetForJob({
      leadId: job.leadId,
      quoteId: job.quoteId,
      productionJobId: job.id,
      type: template.type,
      title: template.title,
      content: template.content,
      status: ProofStatus.TODO
    }));
  }

  return { job, proofAssets };
}

async function ensureProofAssetFromLeadActivity(leadId: string, type: ProofAssetType, status: ProofStatus, title: string, content: string) {
  const job = await prisma.productionJob.findFirst({ where: { leadId }, orderBy: { updatedAt: "desc" } });
  return ensureProofAssetForJob({
    leadId,
    quoteId: job?.quoteId ?? null,
    productionJobId: job?.id ?? null,
    type,
    title,
    content,
    status
  });
}

async function syncProofFromCompletedActivity(activity: { leadId: string; title: string; note: string | null }) {
  const text = `${activity.title} ${activity.note ?? ""}`.toLowerCase();
  if (text.includes("request review") || text.includes("review requested")) {
    await ensureProofAssetFromLeadActivity(activity.leadId, ProofAssetType.REVIEW_REQUEST, ProofStatus.REQUESTED, "Request client review", "Review request was completed from follow-up workflow.");
  }
  if (text.includes("before/after") || text.includes("before after")) {
    await ensureProofAssetFromLeadActivity(activity.leadId, ProofAssetType.BEFORE_AFTER, ProofStatus.DRAFTED, "Create before/after content", "Before/after content task was completed from follow-up workflow.");
  }
  if (text.includes("referral")) {
    await ensureProofAssetFromLeadActivity(activity.leadId, ProofAssetType.REFERRAL_REQUEST, ProofStatus.REQUESTED, "Ask for referral", "Referral request was completed from follow-up workflow.");
  }
}

async function updateProofAssetStatus(proofAssetId: string, status: ProofStatus, title: string, note: string, type: FollowUpActivityType = FollowUpActivityType.NOTE) {
  const proof = await prisma.proofAsset.update({
    where: { id: proofAssetId },
    data: { status },
    include: { lead: true, productionJob: true, quote: true }
  });

  await prisma.followUpActivity.create({
    data: {
      leadId: proof.leadId,
      type,
      title,
      note,
      completedAt: new Date()
    }
  });

  revalidateProductionRoutes(proof.leadId, proof.quoteId ?? undefined);
  revalidatePath("/proof");
  return { ok: true, message: title, proofAssetId: proof.id };
}
function revalidateProductionRoutes(leadId?: string, quoteId?: string) {
  ["/", "/production", "/proof", "/money-today", "/leads", "/quotes", "/reports/revenue", "/follow-ups"].forEach((path) => revalidatePath(path));
  if (leadId) revalidatePath(`/leads/${leadId}`);
  if (quoteId) revalidatePath(`/quotes/${quoteId}`);
}

function productionPriorityFromText(text: string) {
  return /urgent|today|asap|rush|this week/i.test(text) ? ProductionPriority.URGENT : ProductionPriority.NORMAL;
}

async function createProductionJobForQuote(quote: { id: string; leadId: string; businessName: string; serviceCategory: string; expiryDate: Date; lead?: { notes: string | null } }, now = new Date()) {
  const existing = await prisma.productionJob.findUnique({ where: { quoteId: quote.id }, select: { id: true } });
  if (existing) return existing;
  return prisma.productionJob.create({
    data: {
      quoteId: quote.id,
      leadId: quote.leadId,
      title: `${quote.serviceCategory} for ${quote.businessName}`,
      status: ProductionStatus.READY_TO_START,
      priority: productionPriorityFromText(`${quote.serviceCategory} ${quote.businessName} ${quote.lead?.notes ?? ""}`),
      dueDate: quote.expiryDate,
      notes: "Created automatically after deposit/payment threshold was reached."
    },
    select: { id: true }
  });
}
async function updateProductionJobStatus(jobId: string, status: ProductionStatus, title: string, note: string, type: FollowUpActivityType = FollowUpActivityType.NOTE, dueAt?: Date | null, extra?: { installationDate?: Date | null; notes?: string | null }) {
  const job = await prisma.productionJob.update({
    where: { id: jobId },
    data: {
      status,
      ...(extra?.installationDate !== undefined ? { installationDate: extra.installationDate } : {}),
      ...(extra?.notes ? { notes: extra.notes } : {})
    },
    include: { quote: true, lead: true }
  });
  await prisma.followUpActivity.create({
    data: {
      leadId: job.leadId,
      type,
      title,
      note,
      dueAt: dueAt ?? null,
      completedAt: dueAt ? null : new Date()
    }
  });
  revalidateProductionRoutes(job.leadId, job.quoteId);
  return { ok: true, message: title, jobId: job.id };
}

export async function startProductionAction(jobId: string) {
  return updateProductionJobStatus(jobId, ProductionStatus.DESIGN_ARTWORK, "Production started", "Production work has started. Begin design/artwork stage.");
}

export async function markDesignArtworkAction(jobId: string) {
  return updateProductionJobStatus(jobId, ProductionStatus.DESIGN_ARTWORK, "Design / artwork", "Production job is in design/artwork.");
}

export async function markPrintingFabricationAction(jobId: string) {
  return updateProductionJobStatus(jobId, ProductionStatus.PRINTING_FABRICATION, "Printing / fabrication", "Production job has moved to printing/fabrication.");
}

export async function scheduleInstallationAction(formData: FormData) {
  const jobId = requiredString(formData, "jobId");
  const installationDate = optionalDate(formData.get("installationDate"));
  const notes = requiredString(formData, "notes");
  if (!jobId || !installationDate) throw new Error("Job and installation date are required.");
  await updateProductionJobStatus(jobId, ProductionStatus.INSTALLATION_SCHEDULED, "Installation scheduled", `Installation scheduled for ${installationDate.toISOString().slice(0, 10)}.${notes ? ` Notes: ${notes}` : ""}`, FollowUpActivityType.NOTE, null, { installationDate, notes });
}

export async function markInstalledDeliveredAction(jobId: string) {
  console.log("[production-action] markInstalledDeliveredAction", { jobId });
  try {
    const job = await prisma.productionJob.findUnique({ where: { id: jobId }, include: { quote: { include: { payments: true, lineItems: true } } } });
    console.log("[production-action] installed resolved job", job ? { id: job.id, status: job.status, leadId: job.leadId, quoteId: job.quoteId } : null);
    if (!job) return { ok: false, message: `Production job not found: ${jobId}` };
    const paid = job.quote.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const balance = Math.max(Number(job.quote.finalTotal) - paid, 0);
    const status = balance > 0 ? ProductionStatus.AWAITING_BALANCE : ProductionStatus.INSTALLED_DELIVERED;
    if (job.status !== status) {
      await prisma.productionJob.update({ where: { id: jobId }, data: { status } });
      await ensureCompletedActivity(job.leadId, "Installed / delivered", "Job has been installed or delivered.", FollowUpActivityType.NOTE);
    }
    if (balance > 0) {
      await ensurePendingFollowUp(job.leadId, "Collect balance", "Job delivered/installed. Balance remains due.", FollowUpActivityType.WHATSAPP, new Date());
    }
    revalidateProductionRoutes(job.leadId, job.quoteId);
    return { ok: true, message: "Installed / delivered", balance };
  } catch (error) {
    console.error("[production-action] markInstalledDeliveredAction failed", { jobId, error });
    return { ok: false, message: error instanceof Error ? error.message : "Unable to mark installed" };
  }
}
export async function requestBalanceAction(jobId: string) {
  console.log("[production-action] requestBalanceAction", { jobId });
  try {
    const job = await prisma.productionJob.findUnique({ where: { id: jobId } });
    console.log("[production-action] balance resolved job", job ? { id: job.id, status: job.status, leadId: job.leadId, quoteId: job.quoteId } : null);
    if (!job) return { ok: false, message: `Production job not found: ${jobId}` };
    if (job.status !== ProductionStatus.AWAITING_BALANCE) {
      await prisma.productionJob.update({ where: { id: jobId }, data: { status: ProductionStatus.AWAITING_BALANCE } });
    }
    await ensurePendingFollowUp(job.leadId, "Collect balance", "Job delivered/installed. Balance remains due.", FollowUpActivityType.WHATSAPP, new Date());
    revalidateProductionRoutes(job.leadId, job.quoteId);
    return { ok: true, message: "Balance requested" };
  } catch (error) {
    console.error("[production-action] requestBalanceAction failed", { jobId, error });
    return { ok: false, message: error instanceof Error ? error.message : "Unable to request balance" };
  }
}
export async function markProductionCompletedAction(jobId: string) {
  console.log("[production-action] markProductionCompletedAction", { jobId });
  try {
    if (!jobId) return { ok: false, message: "Missing job id" };
    const existingJob = await prisma.productionJob.findUnique({ where: { id: jobId } });
    console.log("[production-action] mark completed resolved job", existingJob ? { id: existingJob.id, status: existingJob.status, leadId: existingJob.leadId, quoteId: existingJob.quoteId } : null);
    if (!existingJob) return { ok: false, message: `Production job not found: ${jobId}` };

    if (existingJob.status !== ProductionStatus.COMPLETED && existingJob.status !== ProductionStatus.REVIEW_REQUESTED) {
      console.log("[production-action] updating job status to COMPLETED", { jobId });
      await prisma.productionJob.update({ where: { id: jobId }, data: { status: ProductionStatus.COMPLETED } });
      await ensureCompletedActivity(existingJob.leadId, "Production completed", "Production job has been completed.", FollowUpActivityType.NOTE);
    }

    const { job } = await ensureDefaultProofAssetsForCompletedJob(jobId);
    const due = tomorrow();
    await ensurePendingFollowUp(job.leadId, "Request review", "Ask client for review/testimonial after completed work.", FollowUpActivityType.WHATSAPP, due);
    await ensurePendingFollowUp(job.leadId, "Create before/after content", "Use completed work as marketing content.", FollowUpActivityType.NOTE, due);
    await ensurePendingFollowUp(job.leadId, "Ask for referral", "Ask the happy client to refer another business.", FollowUpActivityType.WHATSAPP, due);

    revalidateProductionRoutes(job.leadId, job.quoteId);
    revalidatePath("/proof");
    return { ok: true, message: existingJob.status === ProductionStatus.REVIEW_REQUESTED ? "Proof workflow already active" : "Proof workflow activated", jobId };
  } catch (error) {
    console.error("[production-action] markProductionCompletedAction failed", { jobId, error });
    return { ok: false, message: error instanceof Error ? error.message : "Unable to complete production job" };
  }
}
export async function requestReviewAction(id: string) {
  console.log("[production-action] requestReviewAction", { id });
  try {
    if (!id) return { ok: false, message: "Missing job or proof id" };
    const job = await prisma.productionJob.findUnique({ where: { id } });
    if (job) {
      console.log("[production-action] request review resolved job", { id: job.id, status: job.status, leadId: job.leadId, quoteId: job.quoteId });
      await ensureDefaultProofAssetsForCompletedJob(job.id);
      const reviewProof = await ensureProofAssetForJob({
        leadId: job.leadId,
        quoteId: job.quoteId,
        productionJobId: job.id,
        type: ProofAssetType.REVIEW_REQUEST,
        title: "Request client review",
        content: "Ask client for a Google review or WhatsApp testimonial.",
        status: ProofStatus.REQUESTED
      });
      if (job.status !== ProductionStatus.REVIEW_REQUESTED) {
        console.log("[production-action] updating job status to REVIEW_REQUESTED", { jobId: job.id });
        await prisma.productionJob.update({ where: { id: job.id }, data: { status: ProductionStatus.REVIEW_REQUESTED } });
      }
      await ensureCompletedActivity(job.leadId, "Review requested", "Asked client for a review/testimonial after completed work.", FollowUpActivityType.WHATSAPP);
      revalidateProductionRoutes(job.leadId, job.quoteId);
      revalidatePath("/proof");
      return { ok: true, message: reviewProof.status === ProofStatus.REQUESTED ? "Review already requested" : "Review requested", proofAssetId: reviewProof.id };
    }

    const proof = await prisma.proofAsset.findUnique({ where: { id } });
    console.log("[production-action] request review resolved proof", proof ? { id: proof.id, type: proof.type, status: proof.status, leadId: proof.leadId, quoteId: proof.quoteId, productionJobId: proof.productionJobId } : null);
    if (!proof) return { ok: false, message: `Production job or proof asset not found: ${id}` };
    const updated = await ensureProofAssetForJob({
      leadId: proof.leadId,
      quoteId: proof.quoteId,
      productionJobId: proof.productionJobId,
      type: proof.type,
      title: proof.title,
      content: proof.content,
      status: ProofStatus.REQUESTED
    });
    await ensureCompletedActivity(proof.leadId, "Review requested", "Asked client for a review/testimonial after completed work.", FollowUpActivityType.WHATSAPP);
    revalidateProductionRoutes(proof.leadId, proof.quoteId ?? undefined);
    revalidatePath("/proof");
    return { ok: true, message: updated.status === ProofStatus.REQUESTED ? "Review already requested" : "Review requested", proofAssetId: updated.id };
  } catch (error) {
    console.error("[production-action] requestReviewAction failed", { id, error });
    return { ok: false, message: error instanceof Error ? error.message : "Unable to request review" };
  }
}
export async function markReviewReceivedAction(proofAssetId: string) {
  const result = await updateProofAssetStatus(proofAssetId, ProofStatus.RECEIVED, "Review received", "Client review/testimonial was received.");
  const proof = await prisma.proofAsset.findUnique({ where: { id: proofAssetId }, include: { lead: true, quote: { include: { lineItems: true } }, productionJob: true } });
  if (proof) {
    await ensureProofAssetForJob({
      leadId: proof.leadId,
      quoteId: proof.quoteId,
      productionJobId: proof.productionJobId,
      type: ProofAssetType.SOCIAL_POST,
      title: "Draft social proof post",
      content: generateProofContentDrafts({
        lead: {
          id: proof.lead.id,
          name: proof.lead.name,
          phone: proof.lead.phone,
          email: proof.lead.email,
          businessName: proof.lead.businessName,
          businessType: proof.lead.businessType,
          source: proof.lead.source,
          serviceInterestedIn: proof.lead.serviceInterestedIn,
          status: proof.lead.status,
          dealValue: Number(proof.lead.dealValue),
          estimatedDealValue: Number(proof.lead.estimatedDealValue ?? proof.lead.dealValue),
          birthday: "",
          notes: proof.lead.notes ?? "",
          createdAt: "",
          nextFollowUpDate: ""
        },
        quote: proof.quote ? {
          id: proof.quote.id,
          leadId: proof.quote.leadId,
          clientName: proof.quote.clientName,
          businessName: proof.quote.businessName,
          quoteNumber: proof.quote.quoteNumber,
          serviceCategory: proof.quote.serviceCategory,
          lineItems: proof.quote.lineItems.map((item) => ({ id: item.id, description: item.description, quantity: item.quantity, unitPrice: Number(item.unitPrice) })),
          discount: Number(proof.quote.discount),
          status: proof.quote.status,
          notes: proof.quote.notes ?? "",
          terms: proof.quote.terms ?? "",
          createdAt: "",
          expiryDate: ""
        } : null,
        job: proof.productionJob ? {
          id: proof.productionJob.id,
          quoteId: proof.productionJob.quoteId,
          leadId: proof.productionJob.leadId,
          title: proof.productionJob.title,
          status: proof.productionJob.status,
          priority: proof.productionJob.priority,
          dueDate: proof.productionJob.dueDate?.toISOString().slice(0, 10) ?? null,
          installationDate: proof.productionJob.installationDate?.toISOString().slice(0, 10) ?? null,
          notes: proof.productionJob.notes ?? "",
          createdAt: "",
          updatedAt: ""
        } : null
      }).facebookCaption,
      status: ProofStatus.TODO
    });
  }
  return result;
}

export async function draftSocialPostAction(proofAssetId: string) {
  const proof = await prisma.proofAsset.findUnique({ where: { id: proofAssetId }, include: { lead: true, quote: { include: { lineItems: true } }, productionJob: true } });
  if (!proof) throw new Error(`Proof asset not found: ${proofAssetId}`);
  const lead = {
    id: proof.lead.id,
    name: proof.lead.name,
    phone: proof.lead.phone,
    email: proof.lead.email,
    businessName: proof.lead.businessName,
    businessType: proof.lead.businessType,
    source: proof.lead.source,
    serviceInterestedIn: proof.lead.serviceInterestedIn,
    status: proof.lead.status,
    dealValue: Number(proof.lead.dealValue),
    estimatedDealValue: Number(proof.lead.estimatedDealValue ?? proof.lead.dealValue),
    birthday: "",
    notes: proof.lead.notes ?? "",
    createdAt: "",
    nextFollowUpDate: ""
  };
  const quote = proof.quote ? {
    id: proof.quote.id,
    leadId: proof.quote.leadId,
    clientName: proof.quote.clientName,
    businessName: proof.quote.businessName,
    quoteNumber: proof.quote.quoteNumber,
    serviceCategory: proof.quote.serviceCategory,
    lineItems: proof.quote.lineItems.map((item) => ({ id: item.id, description: item.description, quantity: item.quantity, unitPrice: Number(item.unitPrice) })),
    discount: Number(proof.quote.discount),
    status: proof.quote.status,
    notes: proof.quote.notes ?? "",
    terms: proof.quote.terms ?? "",
    createdAt: "",
    expiryDate: ""
  } : null;
  const job = proof.productionJob ? {
    id: proof.productionJob.id,
    quoteId: proof.productionJob.quoteId,
    leadId: proof.productionJob.leadId,
    title: proof.productionJob.title,
    status: proof.productionJob.status,
    priority: proof.productionJob.priority,
    dueDate: proof.productionJob.dueDate?.toISOString().slice(0, 10) ?? null,
    installationDate: proof.productionJob.installationDate?.toISOString().slice(0, 10) ?? null,
    notes: proof.productionJob.notes ?? "",
    createdAt: "",
    updatedAt: ""
  } : null;
  const content = generateProofContentDrafts({ lead, quote, job }).facebookCaption;
  const socialPost = await ensureProofAssetForJob({
    leadId: proof.leadId,
    quoteId: proof.quoteId,
    productionJobId: proof.productionJobId,
    type: ProofAssetType.SOCIAL_POST,
    title: "Social proof post drafted",
    content,
    status: ProofStatus.DRAFTED
  });
  await updateProofAssetStatus(proof.id, proof.type === ProofAssetType.SOCIAL_POST ? ProofStatus.DRAFTED : proof.status, "Social proof drafted", "Drafted a social proof post from this completed work.");
  return { ok: true, message: "Social proof drafted", proofAssetId: socialPost.id };
}

export async function markProofPublishedAction(proofAssetId: string) {
  return updateProofAssetStatus(proofAssetId, ProofStatus.PUBLISHED, "Proof content published", "Published the review, testimonial, before/after, or case study content.");
}

export async function askForReferralAction(id: string) {
  const proof = await prisma.proofAsset.findUnique({ where: { id } });
  if (proof) {
    return updateProofAssetStatus(proof.id, ProofStatus.REQUESTED, "Referral requested", "Asked client to refer another business to Crystal Branding Studio.", FollowUpActivityType.WHATSAPP);
  }

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new Error(`Lead or proof asset not found: ${id}`);
  const created = await prisma.proofAsset.create({
    data: {
      leadId: lead.id,
      type: ProofAssetType.REFERRAL_REQUEST,
      title: "Ask for referral",
      content: "Ask the happy client to refer another business.",
      status: ProofStatus.REQUESTED
    }
  });
  await prisma.followUpActivity.create({ data: { leadId: lead.id, type: FollowUpActivityType.WHATSAPP, title: "Referral requested", note: "Asked client to refer another business to Crystal Branding Studio.", completedAt: new Date() } });
  revalidateProductionRoutes(lead.id);
  revalidatePath("/proof");
  return { ok: true, message: "Referral requested", proofAssetId: created.id };
}
function normalizePaymentMethod(value: string) {
  const method = value.trim().toUpperCase().replaceAll(" ", "_").replaceAll("-", "_");
  return (PaymentMethod as Record<string, PaymentMethod>)[method] ?? PaymentMethod.OTHER;
}

export async function recordPaymentAction(formData: FormData) {
  const quoteId = requiredString(formData, "quoteId");
  const amount = Number(requiredString(formData, "amount"));
  if (!quoteId) throw new Error("Quote is required to record payment.");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Payment amount must be greater than zero.");

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { lead: true, payments: true }
  });
  if (!quote) throw new Error(`Quote not found: ${quoteId}`);

  const now = new Date();
  const paidAt = optionalDate(formData.get("paidAt")) ?? now;
  const method = normalizePaymentMethod(requiredString(formData, "method"));
  const reference = requiredString(formData, "reference");
  const notes = requiredString(formData, "notes");
  const payment = await prisma.payment.create({
    data: {
      quoteId: quote.id,
      leadId: quote.leadId,
      amount: String(amount),
      method,
      reference: reference || null,
      notes: notes || null,
      paidAt
    },
    select: { id: true, amount: true, method: true, reference: true }
  });

  const previousPaid = quote.payments.reduce((sum, item) => sum + Number(item.amount), 0);
  const amountPaid = previousPaid + amount;
  const finalTotal = Number(quote.finalTotal);
  const depositRequired = finalTotal * 0.6;
  const fullPaid = amountPaid >= finalTotal;
  const depositPaid = amountPaid >= depositRequired;
  const next = tomorrow();

  const quoteStatus = fullPaid ? QuoteStatus.PAID : depositPaid ? QuoteStatus.ACCEPTED : quote.status;
  await prisma.quote.update({ where: { id: quote.id }, data: { status: quoteStatus } });
  if (depositPaid || fullPaid) {
    await prisma.lead.update({ where: { id: quote.leadId }, data: { status: LeadStatus.WON } });
  }

  await prisma.followUpActivity.create({
    data: {
      leadId: quote.leadId,
      type: FollowUpActivityType.NOTE,
      title: "Payment recorded",
      note: `Payment recorded: $${amount.toFixed(2)} via ${method}${reference ? `, reference ${reference}` : ""}.${notes ? ` Notes: ${notes}` : ""}`,
      completedAt: now
    }
  });

  if (depositPaid) {
    const productionJob = await createProductionJobForQuote(quote, now);
    await prisma.followUpActivity.create({
      data: {
        leadId: quote.leadId,
        type: FollowUpActivityType.NOTE,
        title: "Production job created",
        note: "Deposit confirmed. Production job is ready to start.",
        completedAt: now
      }
    });
    console.log("[production-action] production job ready", { productionJobId: productionJob.id, quoteId: quote.id });
  }
  if (depositPaid && !fullPaid) {
    await prisma.followUpActivity.createMany({
      data: [
        {
          leadId: quote.leadId,
          type: FollowUpActivityType.NOTE,
          title: "Begin production",
          note: "Deposit confirmed. Begin production workflow.",
          dueAt: now,
          completedAt: null
        },
        {
          leadId: quote.leadId,
          type: FollowUpActivityType.WHATSAPP,
          title: "Collect balance",
          note: "Balance remains after deposit/payment.",
          dueAt: next,
          completedAt: null
        }
      ]
    });
  }

  revalidateSalesRoutes(quote.id, quote.leadId, quote.id);
  revalidateProductionRoutes(quote.leadId, quote.id);
  revalidatePath(`/q/${quote.quoteNumber}`);
  console.log("[payment-action] payment recorded", { paymentId: payment.id, quoteStatus });
}
export async function updateQuoteStatusAction(quoteId: string, statusValue: string) {
  console.log("[quote-action] updateQuoteStatusAction called", { quoteId, statusValue });

  try {
    const status = statusValue as QuoteStatus;
    const now = new Date();
    const next = tomorrow();
    const quote = await findQuoteForAction(quoteId);

    console.log("[quote-action] resolved quote record", quote ? {
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      leadId: quote.leadId
    } : null);
    console.log("[quote-action] resolved lead record", quote?.lead ? {
      id: quote.lead.id,
      name: quote.lead.name,
      status: quote.lead.status
    } : null);
    console.log("[quote-action] status being written", status);

    if (!quote) {
      console.error("[quote-action] quote not found", { quoteId, statusValue });
      return { ok: false, error: `Quote not found for ${quoteId}` };
    }

    const leadStatus = status === QuoteStatus.ACCEPTED || status === QuoteStatus.PAID
      ? LeadStatus.WON
      : status === QuoteStatus.REJECTED
        ? LeadStatus.LOST
        : status === QuoteStatus.SENT
          ? LeadStatus.QUOTE_SENT
          : undefined;

    const quoteUpdate = await prisma.quote.update({
      where: { id: quote.id },
      data: { status },
      select: { id: true, quoteNumber: true, status: true, leadId: true }
    });
    console.log("[quote-action] Prisma quote update result", quoteUpdate);

    const leadUpdate = await prisma.lead.update({
      where: { id: quote.leadId },
      data: {
        ...(leadStatus ? { status: leadStatus } : {}),
        ...(status === QuoteStatus.SENT ? { lastContactedAt: now, nextFollowUpAt: next, nextFollowUpDate: next } : {})
      },
      select: { id: true, status: true, lastContactedAt: true, nextFollowUpAt: true, nextFollowUpDate: true }
    });
    console.log("[quote-action] Prisma lead update result", leadUpdate);

    const activity = await prisma.followUpActivity.create({
      data: {
        leadId: quote.leadId,
        type: status === QuoteStatus.SENT ? FollowUpActivityType.WHATSAPP : FollowUpActivityType.NOTE,
        title: status === QuoteStatus.SENT
          ? "Quote sent"
          : status === QuoteStatus.VIEWED
            ? "Quote viewed"
            : status === QuoteStatus.ACCEPTED
              ? "Quote accepted"
              : status === QuoteStatus.PAID
                ? "Quote paid"
                : status === QuoteStatus.REJECTED
                  ? "Quote rejected"
                  : `Quote ${status.toLowerCase().replaceAll("_", " ")}`,
        note: status === QuoteStatus.SENT
          ? "Quote was sent to the client."
          : `Quote ${quote.quoteNumber} was marked ${status.toLowerCase().replaceAll("_", " ")} from Crystal Growth OS`,
        completedAt: now
      },
      select: { id: true, type: true, title: true, completedAt: true }
    });
    console.log("[quote-action] created FollowUpActivity result", activity);

    const followUpActivity = status === QuoteStatus.SENT
      ? await prisma.followUpActivity.create({
          data: {
            leadId: quote.leadId,
            type: FollowUpActivityType.WHATSAPP,
            title: "Follow up on quote",
            note: "Check if the client is ready to proceed with deposit/payment.",
            dueAt: next,
            completedAt: null
          },
          select: { id: true, type: true, title: true, dueAt: true, completedAt: true }
        })
      : null;
    if (followUpActivity) console.log("[quote-action] created pending quote follow-up", followUpActivity);

    revalidateSalesRoutes(quoteId, quote.leadId, quote.id);
    revalidatePath(`/q/${quote.quoteNumber}`);

    return {
      ok: true,
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      newStatus: quoteUpdate.status,
      leadStatus: leadUpdate.status,
      activityCreated: true,
      message: "Saved to database"
    };
  } catch (error) {
    console.error("[quote-action] updateQuoteStatusAction failed", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown quote status update error"
    };
  }
}

export async function scheduleFollowUpTomorrowAction(quoteId: string) {
  console.log("[quote-action] scheduleFollowUpTomorrowAction called", { quoteId });

  try {
    const quote = await findQuoteForAction(quoteId);
    console.log("[quote-action] resolved quote record", quote ? {
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      leadId: quote.leadId
    } : null);
    console.log("[quote-action] resolved lead record", quote?.lead ? {
      id: quote.lead.id,
      name: quote.lead.name,
      status: quote.lead.status
    } : null);

    if (!quote) {
      console.error("[quote-action] quote not found for follow-up", { quoteId });
      return { ok: false, error: `Quote not found for ${quoteId}` };
    }

    const dueAt = tomorrow();

    const leadUpdate = await prisma.lead.update({
      where: { id: quote.leadId },
      data: { nextFollowUpAt: dueAt, nextFollowUpDate: dueAt },
      select: { id: true, status: true, nextFollowUpAt: true, nextFollowUpDate: true }
    });
    console.log("[quote-action] Prisma lead update result", leadUpdate);

    const activity = await prisma.followUpActivity.create({
      data: {
        leadId: quote.leadId,
        type: FollowUpActivityType.WHATSAPP,
        title: "Follow up on quote",
        note: "Follow up after quote was sent",
        dueAt,
        completedAt: null
      },
      select: { id: true, type: true, title: true, dueAt: true, completedAt: true }
    });
    console.log("[quote-action] created FollowUpActivity result", activity);

    revalidateSalesRoutes(quoteId, quote.leadId, quote.id);
    revalidatePath(`/q/${quote.quoteNumber}`);

    return {
      ok: true,
      activityId: activity.id,
      dueAt: activity.dueAt?.toISOString() ?? dueAt.toISOString(),
      message: "Saved to database"
    };
  } catch (error) {
    console.error("[quote-action] scheduleFollowUpTomorrowAction failed", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown follow-up scheduling error"
    };
  }
}
































