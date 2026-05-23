import "server-only";
import { Lead as PrismaLead, Quote as PrismaQuote, QuoteLineItem as PrismaQuoteLineItem, FollowUpActivity as PrismaActivity, LeadAsset as PrismaLeadAsset, Payment as PrismaPayment, ProductionJob as PrismaProductionJob, ProofAsset as PrismaProofAsset } from "@prisma/client";
import { followUpActivities, Lead, leads, Quote, quotes } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { suggestQuoteLineItems } from "@/lib/quote-suggestions";

const statusToLabel = {
  NEW_LEAD: "New Lead",
  CONTACTED: "Contacted",
  QUOTE_REQUESTED: "Quote Requested",
  QUOTE_SENT: "Quote Sent",
  FOLLOW_UP_NEEDED: "Follow-Up Needed",
  NEGOTIATING: "Negotiating",
  WON: "Won",
  LOST: "Lost"
} as const;

const quoteStatusToLabel = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  FOLLOW_UP_DUE: "Follow-Up Due",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  PAID: "Paid"
} as const;

export type ActivityView = {
  id: string;
  leadId: string;
  type: string;
  title: string;
  note: string;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type QuoteDetailSource = "database" | "fallback";

export type PaymentView = {
  id: string;
  quoteId: string;
  leadId: string | null;
  amount: number;
  method: string;
  reference: string;
  notes: string;
  paidAt: string;
  createdAt: string;
};

export type ProductionJobView = {
  id: string;
  quoteId: string;
  leadId: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  installationDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ProofAssetView = {
  id: string;
  leadId: string;
  quoteId: string | null;
  productionJobId: string | null;
  type: string;
  title: string;
  content: string;
  url: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
export type LeadAssetView = {
  id: string;
  leadId: string;
  type: string;
  url: string;
  pathname: string;
  filename: string;
  contentType: string;
  size: number;
  notes: string;
  createdAt: string;
};

function quoteNumberFromDemoId(quoteId: string) {
  const match = quoteId.match(/^quote-(\d+)$/);
  if (!match) return null;
  return `CBS-2026-${match[1].padStart(3, "0")}`;
}

function iso(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function mapLead(lead: PrismaLead): Lead {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    businessName: lead.businessName,
    businessType: lead.businessType,
    source: lead.source,
    serviceInterestedIn: lead.serviceInterestedIn,
    status: statusToLabel[lead.status],
    dealValue: Number(lead.dealValue),
    estimatedDealValue: Number(lead.estimatedDealValue ?? lead.dealValue),
    birthday: iso(lead.birthday),
    notes: lead.notes ?? "",
    createdAt: iso(lead.createdAt),
    lastContactedAt: lead.lastContactedAt ? iso(lead.lastContactedAt) : null,
    nextFollowUpDate: iso(lead.nextFollowUpAt ?? lead.nextFollowUpDate),
    isCustomer: lead.status === "WON"
  };
}

function mapQuote(quote: PrismaQuote & { lineItems: PrismaQuoteLineItem[] }): Quote {
  return {
    id: quote.id,
    leadId: quote.leadId,
    clientName: quote.clientName,
    businessName: quote.businessName,
    quoteNumber: quote.quoteNumber,
    serviceCategory: quote.serviceCategory,
    lineItems: quote.lineItems.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice)
    })),
    discount: Number(quote.discount),
    status: quoteStatusToLabel[quote.status],
    notes: quote.notes ?? "",
    terms: quote.terms ?? "",
    createdAt: iso(quote.createdAt),
    expiryDate: iso(quote.expiryDate)
  };
}

function mapProductionJob(job: PrismaProductionJob): ProductionJobView {
  return {
    id: job.id,
    quoteId: job.quoteId,
    leadId: job.leadId,
    title: job.title,
    status: job.status,
    priority: job.priority,
    dueDate: job.dueDate ? iso(job.dueDate) : null,
    installationDate: job.installationDate ? iso(job.installationDate) : null,
    notes: job.notes ?? "",
    createdAt: iso(job.createdAt),
    updatedAt: iso(job.updatedAt)
  };
}

function mapProofAsset(asset: PrismaProofAsset): ProofAssetView {
  return {
    id: asset.id,
    leadId: asset.leadId,
    quoteId: asset.quoteId,
    productionJobId: asset.productionJobId,
    type: asset.type,
    title: asset.title,
    content: asset.content ?? "",
    url: asset.url ?? "",
    status: asset.status,
    createdAt: iso(asset.createdAt),
    updatedAt: iso(asset.updatedAt)
  };
}
function mapPayment(payment: PrismaPayment): PaymentView {
  return {
    id: payment.id,
    quoteId: payment.quoteId,
    leadId: payment.leadId,
    amount: Number(payment.amount),
    method: payment.method,
    reference: payment.reference ?? "",
    notes: payment.notes ?? "",
    paidAt: iso(payment.paidAt),
    createdAt: iso(payment.createdAt)
  };
}

function mapAsset(asset: PrismaLeadAsset): LeadAssetView {
  return {
    id: asset.id,
    leadId: asset.leadId,
    type: asset.type,
    url: asset.url,
    pathname: asset.pathname,
    filename: asset.filename,
    contentType: asset.contentType,
    size: asset.size,
    notes: asset.notes ?? "",
    createdAt: iso(asset.createdAt)
  };
}
function mapActivity(activity: PrismaActivity): ActivityView {
  return {
    id: activity.id,
    leadId: activity.leadId,
    type: activity.type,
    title: activity.title,
    note: activity.note ?? "",
    dueAt: activity.dueAt ? iso(activity.dueAt) : null,
    completedAt: activity.completedAt ? iso(activity.completedAt) : null,
    createdAt: iso(activity.createdAt)
  };
}

export async function getLeadsForPage() {
  try {
    const dbLeads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
    return dbLeads.map(mapLead);
  } catch {
    return leads;
  }
}

export async function getLeadsPageData() {
  try {
    const dbLeads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
    return { source: "database" as const, leads: dbLeads.map(mapLead) };
  } catch (error) {
    console.error("[leads-page] database lookup failed", error);
    return { source: "fallback" as const, leads };
  }
}
export async function getLeadDetailForPage(id: string) {
  try {
    const dbLead = await prisma.lead.findUnique({
      where: { id },
      include: {
        quotes: { include: { lineItems: true }, orderBy: { createdAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" } },
        assets: { orderBy: { createdAt: "desc" } },
        payments: { orderBy: { paidAt: "desc" } },
        productionJobs: { orderBy: { updatedAt: "desc" } },
        proofAssets: { orderBy: { updatedAt: "desc" } }
      }
    });

    if (dbLead) {
      return {
        lead: mapLead(dbLead),
        quotes: dbLead.quotes.map(mapQuote),
        activities: dbLead.activities.map(mapActivity),
        assets: dbLead.assets.map(mapAsset),
        payments: dbLead.payments.map(mapPayment),
        productionJobs: dbLead.productionJobs.map(mapProductionJob),
        proofAssets: dbLead.proofAssets.map(mapProofAsset)
      };
    }
  } catch {}

  const lead = leads.find((item) => item.id === id);
  if (!lead) return null;
  return {
    lead,
    quotes: quotes.filter((quote) => quote.leadId === id),
    activities: followUpActivities.filter((activity) => activity.leadId === id),
    assets: [],
    payments: [],
    productionJobs: [],
    proofAssets: []
  };
}

export async function getQuoteDetailForPage(id: string) {
  try {
    const quoteNumber = quoteNumberFromDemoId(id) ?? (id.startsWith("CBS-") ? id : null);
    const dbQuote = await prisma.quote.findFirst({
      where: quoteNumber ? { quoteNumber } : { id },
      include: { lineItems: true, lead: true, payments: { orderBy: { paidAt: "desc" } }, productionJob: true }
    });

    if (dbQuote) {
      return {
        quote: mapQuote(dbQuote),
        lead: mapLead(dbQuote.lead),
        payments: dbQuote.payments.map(mapPayment),
        productionJob: dbQuote.productionJob ? mapProductionJob(dbQuote.productionJob) : null,
        source: "database" as QuoteDetailSource
      };
    }
  } catch (error) {
    console.error("[quote-detail] database quote lookup failed", { id, error });
  }

  console.log("Using mock fallback for quote", { id });
  const quote = quotes.find((item) => item.id === id || item.quoteNumber === id);
  if (!quote) return null;
  const lead = leads.find((item) => item.id === quote.leadId);
  return { quote, lead, payments: [], productionJob: null, source: "fallback" as QuoteDetailSource };
}
export async function getNextQuoteNumber() {
  const year = new Date().getFullYear();
  try {
    const count = await prisma.quote.count();
    return `CBS-${year}-${String(count + 1).padStart(3, "0")}`;
  } catch {
    return `CBS-${year}-001`;
  }
}

export async function getQuoteCreateData(leadId?: string | null) {
  try {
    const [dbLeads, quoteNumber] = await Promise.all([
      prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
      getNextQuoteNumber()
    ]);

    const selectedLead = leadId
      ? await prisma.lead.findUnique({
          where: { id: leadId },
          include: {
            assets: { orderBy: { createdAt: "desc" } },
        payments: { orderBy: { paidAt: "desc" } },
        productionJobs: { orderBy: { updatedAt: "desc" } },
        proofAssets: { orderBy: { updatedAt: "desc" } },
            activities: { orderBy: { createdAt: "desc" }, take: 8 },
            quotes: { include: { lineItems: true }, orderBy: { createdAt: "desc" } }
          }
        })
      : null;

    const latestMockupActivity = selectedLead?.activities.find((activity) => /mockup|ready for quote/i.test(`${activity.title} ${activity.note ?? ""}`));
    const suggestedLineItems = selectedLead ? suggestQuoteLineItems(selectedLead.serviceInterestedIn, selectedLead.notes ?? "") : [];
    const leadNotes = selectedLead ? [
      selectedLead.notes ?? "",
      latestMockupActivity ? `Latest mockup activity: ${latestMockupActivity.title} - ${latestMockupActivity.note ?? ""}` : ""
    ].filter(Boolean).join("\n\n") : "";

    return {
      source: "database" as const,
      leads: dbLeads.map(mapLead),
      quoteNumber,
      selectedLead: selectedLead ? mapLead(selectedLead) : null,
      assets: selectedLead ? selectedLead.assets.map(mapAsset) : [],
      activities: selectedLead ? selectedLead.activities.map(mapActivity) : [],
      existingQuotes: selectedLead ? selectedLead.quotes.map(mapQuote) : [],
      suggestedLineItems,
      initialQuote: selectedLead ? {
        leadId: selectedLead.id,
        clientName: selectedLead.name,
        businessName: selectedLead.businessName,
        quoteNumber,
        serviceCategory: selectedLead.serviceInterestedIn,
        notes: leadNotes,
        terms: "50% deposit to start production. Balance due before installation or collection. Quote valid for 14 days.",
        discount: 0,
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        lineItems: suggestedLineItems
      } : null
    };
  } catch (error) {
    console.error("[quote-create] database lookup failed", error);
    return {
      source: "fallback" as const,
      leads,
      quoteNumber: `CBS-${new Date().getFullYear()}-001`,
      selectedLead: null,
      assets: [],
      activities: [],
      existingQuotes: [],
      suggestedLineItems: [],
      initialQuote: null
    };
  }
}
export async function getQuotesForPage() {
  try {
    const dbQuotes = await prisma.quote.findMany({ include: { lineItems: true }, orderBy: { createdAt: "desc" } });
    return dbQuotes.map(mapQuote);
  } catch {
    return quotes;
  }
}

export async function getRevenueSourceData() {
  try {
    const [dbLeads, dbQuotes, dbActivities, dbAssets, dbPayments, dbProductionJobs, dbProofAssets] = await Promise.all([
      prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.quote.findMany({ include: { lineItems: true }, orderBy: { createdAt: "desc" } }),
      prisma.followUpActivity.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.leadAsset.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.payment.findMany({ orderBy: { paidAt: "desc" } }),
      prisma.productionJob.findMany({ orderBy: { updatedAt: "desc" } }),
      prisma.proofAsset.findMany({ orderBy: { updatedAt: "desc" } })
    ]);

    return {
      leads: dbLeads.map(mapLead),
      quotes: dbQuotes.map(mapQuote),
      activities: dbActivities.map(mapActivity),
      assets: dbAssets.map(mapAsset),
      payments: dbPayments.map(mapPayment),
      productionJobs: dbProductionJobs.map(mapProductionJob),
      proofAssets: dbProofAssets.map(mapProofAsset),
      source: "database" as const
    };
  } catch (error) {
    console.error("[revenue-source] database lookup failed", error);
    return { leads, quotes, activities: followUpActivities, assets: [], payments: [], productionJobs: [], proofAssets: [], source: "fallback" as const };
  }
}





export async function getMoneyTodayPageData() {
  const data = await getRevenueSourceData();
  return {
    source: data.source,
    leads: data.leads,
    quotes: data.quotes,
    activities: data.activities,
    assets: data.assets,
    payments: data.payments,
    productionJobs: data.productionJobs,
    proofAssets: data.proofAssets
  };
}

export async function getMockupBoardData() {
  try {
    const dbLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { source: { contains: "Shopfront", mode: "insensitive" } },
          { source: { contains: "mockup", mode: "insensitive" } },
          { serviceInterestedIn: { contains: "Shopfront", mode: "insensitive" } },
          { serviceInterestedIn: { contains: "mockup", mode: "insensitive" } }
        ]
      },
      orderBy: { updatedAt: "desc" },
      include: {
        assets: { orderBy: { createdAt: "desc" } },
        payments: { orderBy: { paidAt: "desc" } },
        productionJobs: { orderBy: { updatedAt: "desc" } },
        proofAssets: { orderBy: { updatedAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" } },
        quotes: { include: { lineItems: true }, orderBy: { createdAt: "desc" } }
      }
    });

    return {
      source: "database" as const,
      leads: dbLeads.map(mapLead),
      assets: dbLeads.flatMap((lead) => lead.assets.map(mapAsset)),
      activities: dbLeads.flatMap((lead) => lead.activities.map(mapActivity)),
      quotes: dbLeads.flatMap((lead) => lead.quotes.map(mapQuote))
    };
  } catch (error) {
    console.error("[mockups-board] database lookup failed", error);
    return { source: "fallback" as const, leads: [], assets: [], activities: [], quotes: [] };
  }
}
export type IntakeInboxItem = Lead & {
  urgency: string;
  suggestedNextAction: string;
  isHighUrgency: boolean;
  assetCount: number;
  hasShopfrontImage: boolean;
  hasLogo: boolean;
  hasReferenceImage: boolean;
};

function parseNoteValue(notes: string, label: string) {
  const line = notes.split(/\r?\n/).find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return line ? line.slice(label.length + 1).trim() : "Not provided";
}

function intakeSuggestion(lead: Lead, urgency: string, assets: LeadAssetView[] = []) {
  const hasShopfrontImage = assets.some((asset) => asset.type === "SHOPFRONT_IMAGE");
  const hasLogo = assets.some((asset) => asset.type === "LOGO");

  if (lead.source.toLowerCase().includes("shopfront") && !hasLogo) return "Request missing logo";
  if (lead.source.toLowerCase().includes("shopfront") && !hasShopfrontImage) return "Request shopfront image";
  if (lead.source.toLowerCase().includes("shopfront") && hasLogo && hasShopfrontImage) return "Prepare mockup";

  if (urgency.toLowerCase().includes("urgent") || urgency.toLowerCase().includes("today")) {
    return "Send WhatsApp now and ask for photos, measurements, and decision deadline.";
  }

  return "Send first response, confirm brief details, and move the lead toward a quote.";
}

function toIntakeItem(lead: Lead, assets: LeadAssetView[] = []): IntakeInboxItem {
  const urgency = parseNoteValue(lead.notes, "Urgency");
  const hasShopfrontImage = assets.some((asset) => asset.type === "SHOPFRONT_IMAGE");
  const hasLogo = assets.some((asset) => asset.type === "LOGO");
  const hasReferenceImage = assets.some((asset) => asset.type === "REFERENCE_IMAGE");

  return {
    ...lead,
    urgency,
    suggestedNextAction: intakeSuggestion(lead, urgency, assets),
    isHighUrgency: /urgent|today|24|this week/i.test(urgency),
    assetCount: assets.length,
    hasShopfrontImage,
    hasLogo,
    hasReferenceImage
  };
}

export async function getRecentIntakeLeads() {
  try {
    const dbLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { source: { contains: "Website intake", mode: "insensitive" } },
          { source: { contains: "Shopfront mockup", mode: "insensitive" } }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { assets: true }
    });

    return { source: "database" as const, leads: dbLeads.map((lead) => toIntakeItem(mapLead(lead), lead.assets.map(mapAsset))) };
  } catch (error) {
    console.error("[intake-inbox] database lookup failed", error);
    const fallback = leads
      .filter((lead) => /website|shopfront/i.test(lead.source))
      .map((lead) => toIntakeItem(lead));
    return { source: "fallback" as const, leads: fallback };
  }
}

export async function getIntakeInboxData() {
  try {
    const dbLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { source: { contains: "Website intake", mode: "insensitive" } },
          { source: { contains: "Shopfront mockup", mode: "insensitive" } },
          { lastContactedAt: null }
        ]
      },
      orderBy: [{ lastContactedAt: "asc" }, { createdAt: "desc" }],
      take: 40,
      include: { assets: true }
    });

    const items = dbLeads.map((lead) => toIntakeItem(mapLead(lead), lead.assets.map(mapAsset)));
    return {
      source: "database" as const,
      items,
      newWebsiteLeads: items.filter((lead) => /website intake/i.test(lead.source)),
      shopfrontRequests: items.filter((lead) => /shopfront mockup/i.test(lead.source)),
      uncontactedLeads: items.filter((lead) => !lead.lastContactedAt),
      highUrgencyLeads: items.filter((lead) => lead.isHighUrgency)
    };
  } catch (error) {
    console.error("[intake-inbox] database lookup failed", error);
    const items = leads.filter((lead) => /website|shopfront/i.test(lead.source) || !lead.lastContactedAt).map((lead) => toIntakeItem(lead));
    return {
      source: "fallback" as const,
      items,
      newWebsiteLeads: items.filter((lead) => /website intake/i.test(lead.source)),
      shopfrontRequests: items.filter((lead) => /shopfront mockup/i.test(lead.source)),
      uncontactedLeads: items.filter((lead) => !lead.lastContactedAt),
      highUrgencyLeads: items.filter((lead) => lead.isHighUrgency)
    };
  }
}

export async function getProductionBoardData() {
  try {
    const jobs = await prisma.productionJob.findMany({
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      include: {
        lead: true,
        quote: { include: { lineItems: true, payments: { orderBy: { paidAt: "desc" } }, proofAssets: { orderBy: { updatedAt: "desc" } } } },
        proofAssets: { orderBy: { updatedAt: "desc" } }
      }
    });

    return {
      source: "database" as const,
      jobs: jobs.map((job) => ({
        job: mapProductionJob(job),
        lead: mapLead(job.lead),
        quote: mapQuote(job.quote),
        payments: job.quote.payments.map(mapPayment),
        proofAssets: [...job.proofAssets, ...job.quote.proofAssets].map(mapProofAsset)
      }))
    };
  } catch (error) {
    console.error("[production-board] database lookup failed", error);
    return { source: "fallback" as const, jobs: [] };
  }
}





export async function getProofBoardData() {
  try {
    const proofAssets = await prisma.proofAsset.findMany({
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      include: {
        lead: true,
        quote: { include: { lineItems: true } },
        productionJob: true
      }
    });

    return {
      source: "database" as const,
      items: proofAssets.map((asset) => ({
        proof: mapProofAsset(asset),
        lead: mapLead(asset.lead),
        quote: asset.quote ? mapQuote(asset.quote) : null,
        productionJob: asset.productionJob ? mapProductionJob(asset.productionJob) : null
      }))
    };
  } catch (error) {
    console.error("[proof-board] database lookup failed", error);
    return { source: "fallback" as const, items: [] };
  }
}
