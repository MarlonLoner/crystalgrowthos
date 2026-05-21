"use server";

import { FollowUpActivityType, LeadStatus, Prisma, QuoteStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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
  if (inputQuoteId) revalidatePath(`/quotes/${inputQuoteId}`);
  if (resolvedQuoteId && resolvedQuoteId !== inputQuoteId) revalidatePath(`/quotes/${resolvedQuoteId}`);
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

  if (input.activityId) {
    await prisma.followUpActivity.update({
      where: { id: input.activityId },
      data: { completedAt: now }
    });
  } else {
    await prisma.followUpActivity.create({
      data: {
        leadId: input.leadId,
        type: FollowUpActivityType.NOTE,
        title: "Follow-up completed",
        note: input.note ?? "Follow-up was marked done from Crystal Growth OS",
        completedAt: now
      }
    });
  }

  revalidateSalesRoutes(undefined, input.leadId);
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
  const activity = await prisma.followUpActivity.create({
    data: { leadId, type: FollowUpActivityType.NOTE, title: "Mockup in design", note: "Shopfront mockup has been moved into design.", completedAt: now },
    select: { id: true }
  });
  revalidateMockupRoutes(leadId);
  return { ok: true, message: "Mockup moved into design", activityId: activity.id };
}

export async function markMockupSentAction(leadId: string) {
  await ensureLeadForMockupAction(leadId);
  const now = new Date();
  const next = tomorrow();
  const sent = await prisma.followUpActivity.create({
    data: { leadId, type: FollowUpActivityType.WHATSAPP, title: "Mockup sent", note: "Mockup was sent to the prospect.", completedAt: now },
    select: { id: true }
  });
  const followUp = await prisma.followUpActivity.create({
    data: { leadId, type: FollowUpActivityType.WHATSAPP, title: "Follow up on mockup", note: "Check if the client likes the mockup and wants a quote.", dueAt: next, completedAt: null },
    select: { id: true }
  });
  revalidateMockupRoutes(leadId);
  return { ok: true, message: "Mockup sent and follow-up scheduled", activityId: sent.id, followUpActivityId: followUp.id };
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
  revalidateMockupRoutes(leadId);
  return { ok: true, message: "Missing assets request logged", activityId: requested.id, followUpActivityId: followUp.id };
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
          ? "Quote was marked as sent from Crystal Growth OS"
          : `Quote ${quote.quoteNumber} was marked ${status.toLowerCase().replaceAll("_", " ")} from Crystal Growth OS`,
        completedAt: now
      },
      select: { id: true, type: true, title: true, completedAt: true }
    });
    console.log("[quote-action] created FollowUpActivity result", activity);

    revalidateSalesRoutes(quoteId, quote.leadId, quote.id);

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













