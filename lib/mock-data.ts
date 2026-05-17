export type LeadStage =
  | "New Lead"
  | "Contacted"
  | "Quote Requested"
  | "Quote Sent"
  | "Follow-Up Needed"
  | "Negotiating"
  | "Won"
  | "Lost";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  businessName: string;
  businessType: string;
  source: string;
  serviceInterestedIn: string;
  status: LeadStage;
  dealValue: number;
  birthday: string;
  notes: string;
  createdAt: string;
  nextFollowUpDate: string;
};

export const stages: LeadStage[] = [
  "New Lead",
  "Contacted",
  "Quote Requested",
  "Quote Sent",
  "Follow-Up Needed",
  "Negotiating",
  "Won",
  "Lost"
];

export const leads: Lead[] = [
  {
    id: "lead-1",
    name: "Amara Dlamini",
    phone: "+27 71 555 0101",
    email: "amara@luminaevents.co.za",
    businessName: "Lumina Events",
    businessType: "Events",
    source: "Instagram DM",
    serviceInterestedIn: "Corporate gifting",
    status: "Quote Sent",
    dealValue: 42000,
    birthday: "1991-08-12",
    notes: "Needs premium welcome packs before conference season.",
    createdAt: "2026-05-02",
    nextFollowUpDate: "2026-05-19"
  },
  {
    id: "lead-2",
    name: "Jason Pillay",
    phone: "+27 82 555 0112",
    email: "jason@northstarfitness.co.za",
    businessName: "Northstar Fitness",
    businessType: "Health and wellness",
    source: "Website form",
    serviceInterestedIn: "Branded activewear",
    status: "Negotiating",
    dealValue: 68500,
    birthday: "1988-11-03",
    notes: "Comparing hoodie and gym towel packages.",
    createdAt: "2026-05-05",
    nextFollowUpDate: "2026-05-17"
  },
  {
    id: "lead-3",
    name: "Mia Jacobs",
    phone: "+27 83 555 0198",
    email: "mia@solacafe.co.za",
    businessName: "Sola Cafe",
    businessType: "Hospitality",
    source: "Referral",
    serviceInterestedIn: "Uniform branding",
    status: "Won",
    dealValue: 27500,
    birthday: "1994-02-21",
    notes: "Won via referral. Ask for Google review after delivery.",
    createdAt: "2026-04-27",
    nextFollowUpDate: "2026-06-03"
  },
  {
    id: "lead-4",
    name: "Thabo Mokoena",
    phone: "+27 79 555 0144",
    email: "thabo@apexlegal.africa",
    businessName: "Apex Legal Africa",
    businessType: "Professional services",
    source: "LinkedIn",
    serviceInterestedIn: "Executive notebooks",
    status: "Follow-Up Needed",
    dealValue: 19800,
    birthday: "1982-06-30",
    notes: "Requested quote revisions with black foil finish.",
    createdAt: "2026-05-09",
    nextFollowUpDate: "2026-05-18"
  },
  {
    id: "lead-5",
    name: "Leah Naidoo",
    phone: "+27 76 555 0131",
    email: "leah@cobalttech.io",
    businessName: "Cobalt Tech",
    businessType: "Technology",
    source: "Webinar",
    serviceInterestedIn: "Launch merchandise",
    status: "New Lead",
    dealValue: 88000,
    birthday: "1990-01-15",
    notes: "High-value launch kit opportunity.",
    createdAt: "2026-05-13",
    nextFollowUpDate: "2026-05-20"
  },
  {
    id: "lead-6",
    name: "Zara Petersen",
    phone: "+27 74 555 0172",
    email: "zara@freshcart.co.za",
    businessName: "FreshCart Grocers",
    businessType: "Retail",
    source: "Facebook ad",
    serviceInterestedIn: "Reusable shopper bags",
    status: "Lost",
    dealValue: 34000,
    birthday: "1987-09-18",
    notes: "Budget paused until Q3.",
    createdAt: "2026-04-19",
    nextFollowUpDate: "2026-07-01"
  }
];

export const campaigns = [
  {
    id: "campaign-1",
    title: "May Welcome Sequence",
    template: "Welcome sequence",
    audience: "New leads from web forms",
    subject: "Welcome to Crystal Branding Studio",
    status: "Draft"
  },
  {
    id: "campaign-2",
    title: "Conference Season Offer",
    template: "Offer email",
    audience: "Events and professional services leads",
    subject: "Brand moments your guests keep",
    status: "Draft"
  }
];

export const automationRules = [
  ["Birthday wishes", "Send warm birthday messages with a small loyalty offer.", true],
  ["Holiday messages", "Queue seasonal greetings and limited-time brand offers.", true],
  ["Quote follow-ups", "Follow up three days after a quote is sent.", true],
  ["Review requests", "Ask won customers for public reviews after delivery.", false],
  ["Referral requests", "Invite happy customers to refer aligned businesses.", false],
  ["Inactive customer revival", "Re-engage customers after 90 days of silence.", true]
] as const;

export const monthlyPerformance = [
  { month: "Jan", leads: 22, quotes: 9, won: 4 },
  { month: "Feb", leads: 28, quotes: 14, won: 6 },
  { month: "Mar", leads: 34, quotes: 18, won: 7 },
  { month: "Apr", leads: 31, quotes: 16, won: 6 },
  { month: "May", leads: 42, quotes: 21, won: 9 }
];

export const contentCategories = [
  { name: "Corporate gifting", value: 38 },
  { name: "Uniform branding", value: 24 },
  { name: "Launch merch", value: 21 },
  { name: "Promotional bags", value: 17 }
];
