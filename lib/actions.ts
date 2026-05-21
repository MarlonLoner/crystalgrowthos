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

async function attachRepeatShopfrontSubmission(formData: FormData, email: string) {
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
  const assets = parseUploadedAssets(formData);
  const hasShopfront = hasAsset(assets, "SHOPFRONT_IMAGE");
  const hasLogo = hasAsset(assets, "LOGO");
  const hasReference = hasAsset(assets, "REFERENCE_IMAGE");
  const assetSummary = `New assets submitted: ${assets.length}. Shopfront: ${hasShopfront ? "yes" : "no"}. Logo: ${hasLogo ? "yes" : "no"}. Reference: ${hasReference ? "yes" : "no"}.`;
  const repeatNote = buildRepeatSubmissionNote({
    title: "Repeat shopfront mockup request",
    budgetRange,
    urgency,
    source,
    notes: submittedNotes,
    preferredStyle,
    deadline
  });

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
      nextFollowUpDate: now,
      activities: {
        create: [
          {
            type: FollowUpActivityType.WHATSAPP,
            title: "Repeat shopfront mockup request",
            note: assetSummary,
            dueAt: now,
            completedAt: null
          },
          {
            type: FollowUpActivityType.NOTE,
            title: "Review updated mockup assets",
            note: "A returning prospect submitted new or updated mockup assets.",
            dueAt: next,
            completedAt: null
          }
        ]
      }
    }
  });

  await createLeadAssetsForLead(existing.id, assets);
  return updated;
}

export async function createShopfrontIntakeLeadAction(formData: FormData) {
  requireIntakeFields(formData, ["name", "phone", "email", "businessName"]);

  const email = normalizeEmail(formData.get("email"));
  if (!email) throw new Error("A valid email is required for shopfront mockup requests.");

  const existingLead = await findLeadByEmail(email);
  if (existingLead) {
    const updated = await attachRepeatShopfrontSubmission(formData, email);
    revalidateIntakeRoutes(updated.id);
    redirect("/intake/thank-you");
  }

  const budgetRange = requiredString(formData, "budgetRange");
  const urgency = requiredString(formData, "urgency");
  const shopfrontImageUrl = requiredString(formData, "shopfrontImageUrl");
  const logoUrl = requiredString(formData, "logoUrl");
  const referenceImageUrl = requiredString(formData, "referenceImageUrl");
  const preferredStyle = requiredString(formData, "preferredStyle");
  const deadline = requiredString(formData, "deadline");
  const source = requiredString(formData, "source") || "Shopfront mockup form";
  const serviceInterestedIn = requiredString(formData, "serviceInterestedIn") || "Shopfront branding mockup";
  const assets = parseUploadedAssets(formData);
  const createAssets = assetCreateData(assets);
  const hasShopfront = hasAsset(assets, "SHOPFRONT_IMAGE");
  const hasLogo = hasAsset(assets, "LOGO");
  const hasReference = hasAsset(assets, "REFERENCE_IMAGE");
  const now = new Date();
  const next = tomorrow();
  const assetSummary = `Assets attached: ${assets.length}. Shopfront: ${hasShopfront ? "yes" : "missing"}. Logo: ${hasLogo ? "yes" : "missing"}. Reference: ${hasReference ? "yes" : "missing"}.`;
  const notes = [
    "Shopfront mockup request",
    `Preferred style: ${preferredStyle || "Not provided"}`,
    `Deadline: ${deadline || "Not provided"}`,
    `Budget range: ${budgetRange || "Not provided"}`,
    `Urgency: ${urgency || "Not provided"}`,
    assetSummary,
    shopfrontImageUrl ? `Shopfront image URL: ${shopfrontImageUrl}` : "Shopfront image URL: Not provided",
    logoUrl ? `Logo URL: ${logoUrl}` : "Logo URL: Not provided",
    referenceImageUrl ? `Reference image URL: ${referenceImageUrl}` : "Reference image URL: Not provided",
    requiredString(formData, "notes") ? `Prospect notes: ${requiredString(formData, "notes")}` : ""
  ].filter(Boolean).join("\n");

  try {
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
        nextFollowUpDate: now,
        assets: createAssets.length ? { create: createAssets } : undefined,
        activities: {
          create: [
            {
              type: FollowUpActivityType.WHATSAPP,
              title: "New shopfront mockup request",
              note: `Service: ${serviceInterestedIn}. Urgency: ${urgency || "Not provided"}. ${assetSummary}`,
              dueAt: now,
              completedAt: null
            },
            {
              type: FollowUpActivityType.NOTE,
              title: "Prepare shopfront mockup",
              note: `${assetSummary} Design notes: ${requiredString(formData, "notes") || preferredStyle || "No extra notes provided"}.`,
              dueAt: next,
              completedAt: null
            }
          ]
        }
      }
    });

    revalidateIntakeRoutes(lead.id);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const updated = await attachRepeatShopfrontSubmission(formData, email);
      revalidateIntakeRoutes(updated.id);
    } else {
      throw error;
    }
  }

  redirect("/intake/thank-you");
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













