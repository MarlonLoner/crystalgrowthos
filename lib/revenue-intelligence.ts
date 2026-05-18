import { Lead, Quote, followUpActivities, leads, quoteFinalTotal, quotes, today } from "@/lib/mock-data";
import { generateWhatsAppScript, ScriptType } from "@/lib/scripts";

export type Priority = "High" | "Medium" | "Low";

export type SuggestedAction = {
  title: string;
  reason: string;
  message: string;
};

export type MoneyActionItem = {
  id: string;
  lead: Lead;
  quote?: Quote;
  quoteValue: number;
  reason: string;
  priority: Priority;
  suggestedAction: SuggestedAction;
};

function dateDiffDays(from: string | null | undefined, to = today) {
  if (!from) return 999;
  return Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
}

function isOpenLead(lead: Lead) {
  return !["Won", "Lost"].includes(lead.status);
}

function isPendingQuote(quote: Quote) {
  return ["Sent", "Viewed", "Follow-Up Due"].includes(quote.status);
}

function isWonQuote(quote: Quote) {
  return ["Accepted", "Paid"].includes(quote.status);
}

function relatedQuoteForLead(lead: Lead) {
  return quotes.find((quote) => quote.leadId === lead.id && isPendingQuote(quote)) ?? quotes.find((quote) => quote.leadId === lead.id);
}

export function getPriority(lead: Lead, quote?: Quote): Priority {
  const quoteValue = quote ? quoteFinalTotal(quote) : 0;
  const value = Math.max(lead.estimatedDealValue, quoteValue);
  const days = dateDiffDays(lead.lastContactedAt);
  const overdue = new Date(lead.nextFollowUpDate) < new Date(today);
  const hotStatus = ["Quote Sent", "Follow-Up Needed", "Negotiating"].includes(lead.status);
  const pendingQuote = quote ? isPendingQuote(quote) : false;
  const highValueService = ["3D signage", "Vehicle branding", "Shopfront branding"].some((service) =>
    lead.serviceInterestedIn.toLowerCase().includes(service.toLowerCase()) || quote?.serviceCategory.toLowerCase().includes(service.toLowerCase())
  );

  let score = 0;
  if (value >= 1800) score += 3;
  else if (value >= 900) score += 2;
  else if (value >= 500) score += 1;
  if (hotStatus) score += 2;
  if (pendingQuote) score += 2;
  if (overdue) score += 2;
  if (days >= 7) score += 1;
  if (days >= 30) score += 2;
  if (!lead.lastContactedAt) score += 2;
  if (highValueService) score += 1;

  if (score >= 6) return "High";
  if (score >= 3) return "Medium";
  return "Low";
}

export function getSuggestedAction(lead: Lead, quote?: Quote): SuggestedAction {
  let scriptType: ScriptType = "quote-follow-up";
  let title = "Send quote follow-up";
  let reason = "There is money waiting for a clear next step.";

  if (!lead.lastContactedAt) {
    scriptType = "first-response";
    title = "Send first response";
    reason = "This lead has not been contacted yet.";
  } else if (quote?.status === "Paid") {
    scriptType = "review-request";
    title = "Request review/testimonial";
    reason = "A paid customer can create proof and referrals.";
  } else if (lead.status === "Won") {
    scriptType = "referral-request";
    title = "Ask for referral";
    reason = "Won customers are the easiest source of warm introductions.";
  } else if (lead.status === "Lost") {
    scriptType = "dead-lead-revival";
    title = "Revive dormant/dead lead";
    reason = "The opportunity can be reopened with a low-pressure check-in.";
  } else if (quote?.status === "Follow-Up Due" || quote?.status === "Sent" || quote?.status === "Viewed") {
    scriptType = "quote-follow-up";
    title = "Send quote follow-up";
    reason = "The quote has been sent but not accepted yet.";
  } else if (lead.status === "Quote Requested") {
    scriptType = "shopfront-logo-request";
    title = "Ask for shopfront photo and logo";
    reason = "The team needs quote inputs before pricing accurately.";
  } else if (dateDiffDays(lead.lastContactedAt) > 60) {
    scriptType = "dead-lead-revival";
    title = "Revive dormant customer";
    reason = "This customer has gone quiet long enough to need a warm restart.";
  } else if (!quote && ["Contacted", "New Lead"].includes(lead.status)) {
    scriptType = "shopfront-logo-request";
    title = "Create quote";
    reason = "The lead needs to move from interest to a priced offer.";
  }

  return {
    title,
    reason,
    message: generateWhatsAppScript(scriptType, lead)
  };
}

export function getMoneyActionItems(): MoneyActionItem[] {
  const items = leads
    .filter((lead) => {
      const quote = relatedQuoteForLead(lead);
      const due = new Date(lead.nextFollowUpDate) <= new Date(today);
      const birthdayThisMonth = new Date(lead.birthday).getMonth() === new Date(today).getMonth();
      const dormant = Boolean(lead.isCustomer && dateDiffDays(lead.lastContactedAt) > 60);
      return due || !lead.lastContactedAt || (quote && isPendingQuote(quote)) || dormant || birthdayThisMonth;
    })
    .map((lead) => {
      const quote = relatedQuoteForLead(lead);
      const quoteValue = quote ? quoteFinalTotal(quote) : 0;
      const overdue = new Date(lead.nextFollowUpDate) < new Date(today);
      const reason = !lead.lastContactedAt
        ? "New lead not contacted"
        : quote && isPendingQuote(quote)
          ? "Quote waiting for response"
          : overdue
            ? "Follow-up overdue"
            : lead.isCustomer && dateDiffDays(lead.lastContactedAt) > 60
              ? "Dormant customer to revive"
              : new Date(lead.birthday).getMonth() === new Date(today).getMonth()
                ? "Birthday this month"
                : "Follow-up due today";

      return {
        id: `${lead.id}-${quote?.id ?? "lead"}`,
        lead,
        quote,
        quoteValue,
        reason,
        priority: getPriority(lead, quote),
        suggestedAction: getSuggestedAction(lead, quote)
      };
    });

  const order: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
  return items.sort((a, b) => order[a.priority] - order[b.priority] || Math.max(b.lead.estimatedDealValue, b.quoteValue) - Math.max(a.lead.estimatedDealValue, a.quoteValue));
}

export function getRevenueMetrics() {
  const month = new Date(today).getMonth();
  const newLeadsThisMonth = leads.filter((lead) => new Date(lead.createdAt).getMonth() === month).length;
  const pendingQuotes = quotes.filter(isPendingQuote);
  const wonQuotes = quotes.filter(isWonQuote);
  const rejectedQuotes = quotes.filter((quote) => quote.status === "Rejected");
  const paidQuotes = quotes.filter((quote) => quote.status === "Paid");
  const sentQuotes = quotes.filter((quote) => ["Sent", "Viewed", "Follow-Up Due", "Accepted", "Paid", "Rejected"].includes(quote.status));
  const overdueQuotes = pendingQuotes.filter((quote) => new Date(quote.expiryDate) < new Date(today) || quote.status === "Follow-Up Due");
  const hotLeads = leads.filter((lead) => isOpenLead(lead) && ["Quote Requested", "Quote Sent", "Follow-Up Needed", "Negotiating"].includes(lead.status));
  const quoteValues = quotes.map(quoteFinalTotal);
  const leadSources = countBy(leads.map((lead) => lead.source));
  const serviceCategories = countBy([...leads.map((lead) => lead.serviceInterestedIn), ...quotes.map((quote) => quote.serviceCategory)]);

  return {
    totalLeads: leads.length,
    newLeadsThisMonth,
    quotesCreated: quotes.length,
    quotesSent: sentQuotes.length,
    quotesAccepted: quotes.filter((quote) => quote.status === "Accepted").length,
    quotesRejected: rejectedQuotes.length,
    quotesPaid: paidQuotes.length,
    pendingQuoteValue: sumQuotes(pendingQuotes),
    overdueQuoteValue: sumQuotes(overdueQuotes),
    hotLeadValue: hotLeads.reduce((total, lead) => total + lead.estimatedDealValue, 0),
    wonRevenueThisMonth: sumQuotes(wonQuotes.filter((quote) => new Date(quote.createdAt).getMonth() === month)),
    lostOpportunityValue: rejectedQuotes.reduce((total, quote) => total + quoteFinalTotal(quote), 0) + leads.filter((lead) => lead.status === "Lost").reduce((total, lead) => total + lead.estimatedDealValue, 0),
    averageQuoteValue: quoteValues.length ? quoteValues.reduce((total, value) => total + value, 0) / quoteValues.length : 0,
    leadToQuoteRate: leads.length ? quotes.length / leads.length : 0,
    quoteAcceptanceRate: sentQuotes.length ? wonQuotes.length / sentQuotes.length : 0,
    quoteToWinRate: quotes.length ? wonQuotes.length / quotes.length : 0,
    bestLeadSource: topEntry(leadSources),
    bestServiceCategory: topEntry(serviceCategories),
    topOpenOpportunities: leads
      .filter(isOpenLead)
      .map((lead) => ({ lead, quote: relatedQuoteForLead(lead), value: Math.max(lead.estimatedDealValue, relatedQuoteForLead(lead) ? quoteFinalTotal(relatedQuoteForLead(lead) as Quote) : 0) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    completedActivities: followUpActivities.filter((activity) => activity.completedAt).length
  };
}

export function getAiRevenueBrief() {
  const metrics = getRevenueMetrics();
  const actions = getMoneyActionItems();
  const biggest = actions[0];
  const totalChaseValue = actions.reduce((total, item) => total + Math.max(item.lead.estimatedDealValue, item.quoteValue), 0);
  const riskCount = actions.filter((item) => item.reason.includes("Quote") || item.reason.includes("overdue")).length;

  return {
    biggestOpportunity: biggest ? `${biggest.lead.businessName} at ${biggest.quoteValue || biggest.lead.estimatedDealValue}` : "No open opportunity",
    totalChaseValue,
    highestPriority: biggest?.lead.businessName ?? "None",
    biggestRisk: `${riskCount} revenue actions are aging without a clear response.`,
    bestNextAction: biggest?.suggestedAction.title ?? "Review the lead list",
    summary: biggest
      ? `Today's best move: follow up with ${actions.length} actions worth ${totalChaseValue.toLocaleString()}. Your hottest opportunity is ${biggest.lead.businessName} for ${biggest.lead.serviceInterestedIn}. Biggest risk: ${riskCount} quote or overdue actions need a response.`
      : "Today's best move: keep the pipeline warm and capture new leads."
  };
}

function sumQuotes(list: Quote[]) {
  return list.reduce((total, quote) => total + quoteFinalTotal(quote), 0);
}

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function topEntry(values: Record<string, number>) {
  const [name = "None", count = 0] = Object.entries(values).sort((a, b) => b[1] - a[1])[0] ?? [];
  return { name, count };
}
