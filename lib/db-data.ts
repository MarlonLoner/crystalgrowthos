import "server-only";
import { Lead as PrismaLead, Quote as PrismaQuote, QuoteLineItem as PrismaQuoteLineItem, FollowUpActivity as PrismaActivity } from "@prisma/client";
import { followUpActivities, Lead, leads, Quote, quotes } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

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
        activities: { orderBy: { createdAt: "desc" } }
      }
    });

    if (dbLead) {
      return {
        lead: mapLead(dbLead),
        quotes: dbLead.quotes.map(mapQuote),
        activities: dbLead.activities.map(mapActivity)
      };
    }
  } catch {}

  const lead = leads.find((item) => item.id === id);
  if (!lead) return null;
  return {
    lead,
    quotes: quotes.filter((quote) => quote.leadId === id),
    activities: followUpActivities.filter((activity) => activity.leadId === id)
  };
}

export async function getQuoteDetailForPage(id: string) {
  try {
    const quoteNumber = quoteNumberFromDemoId(id) ?? (id.startsWith("CBS-") ? id : null);
    const dbQuote = await prisma.quote.findFirst({
      where: quoteNumber ? { quoteNumber } : { id },
      include: { lineItems: true, lead: true }
    });

    if (dbQuote) {
      return {
        quote: mapQuote(dbQuote),
        lead: mapLead(dbQuote.lead),
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
  return { quote, lead, source: "fallback" as QuoteDetailSource };
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
    const [dbLeads, dbQuotes, dbActivities] = await Promise.all([
      prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.quote.findMany({ include: { lineItems: true }, orderBy: { createdAt: "desc" } }),
      prisma.followUpActivity.findMany({ orderBy: { createdAt: "desc" } })
    ]);

    return {
      leads: dbLeads.map(mapLead),
      quotes: dbQuotes.map(mapQuote),
      activities: dbActivities.map(mapActivity)
    };
  } catch {
    return { leads, quotes, activities: followUpActivities };
  }
}





export async function getMoneyTodayPageData() {
  const data = await getRevenueSourceData();
  return {
    source: "database" as const,
    leads: data.leads,
    quotes: data.quotes,
    activities: data.activities
  };
}
export type IntakeInboxItem = Lead & {
  urgency: string;
  suggestedNextAction: string;
  isHighUrgency: boolean;
};

function parseNoteValue(notes: string, label: string) {
  const line = notes.split(/\r?\n/).find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return line ? line.slice(label.length + 1).trim() : "Not provided";
}

function intakeSuggestion(lead: Lead, urgency: string) {
  if (urgency.toLowerCase().includes("urgent") || urgency.toLowerCase().includes("today")) {
    return "Send WhatsApp now and ask for photos, measurements, and decision deadline.";
  }

  if (lead.source.toLowerCase().includes("shopfront")) {
    return "Confirm mockup assets and ask when they want installation or production.";
  }

  return "Send first response, confirm brief details, and move the lead toward a quote.";
}

function toIntakeItem(lead: Lead): IntakeInboxItem {
  const urgency = parseNoteValue(lead.notes, "Urgency");
  return {
    ...lead,
    urgency,
    suggestedNextAction: intakeSuggestion(lead, urgency),
    isHighUrgency: /urgent|today|24|this week/i.test(urgency)
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
      take: 12
    });

    return { source: "database" as const, leads: dbLeads.map(mapLead).map(toIntakeItem) };
  } catch (error) {
    console.error("[intake-inbox] database lookup failed", error);
    const fallback = leads
      .filter((lead) => /website|shopfront/i.test(lead.source))
      .map(toIntakeItem);
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
      take: 40
    });

    const items = dbLeads.map(mapLead).map(toIntakeItem);
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
    const items = leads.filter((lead) => /website|shopfront/i.test(lead.source) || !lead.lastContactedAt).map(toIntakeItem);
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



