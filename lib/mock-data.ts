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
  estimatedDealValue: number;
  birthday: string;
  notes: string;
  createdAt: string;
  lastContactedAt: string | null;
  nextFollowUpDate: string;
  isCustomer?: boolean;
};

export type QuoteStatus =
  | "Draft"
  | "Sent"
  | "Viewed"
  | "Follow-Up Due"
  | "Accepted"
  | "Rejected"
  | "Paid";

export type QuoteLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Quote = {
  id: string;
  leadId: string;
  clientName: string;
  businessName: string;
  quoteNumber: string;
  serviceCategory: string;
  lineItems: QuoteLineItem[];
  discount: number;
  status: QuoteStatus;
  notes: string;
  terms: string;
  createdAt: string;
  expiryDate: string;
};

export const today = "2026-05-18";

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
    name: "Tariro Moyo",
    phone: "+263 77 245 9011",
    email: "tariro@hararefresh.co.zw",
    businessName: "Harare Fresh Foods",
    businessType: "Retail grocery",
    source: "Facebook ad",
    serviceInterestedIn: "Shopfront branding",
    status: "Quote Sent",
    dealValue: 1850,
    estimatedDealValue: 1850,
    birthday: "1989-05-23",
    notes: "Needs illuminated shopfront signage before month-end opening.",
    createdAt: "2026-05-03",
    lastContactedAt: "2026-05-13",
    nextFollowUpDate: "2026-05-18"
  },
  {
    id: "lead-2",
    name: "Blessing Ncube",
    phone: "+263 71 843 2204",
    email: "blessing@swiftlogistics.co.zw",
    businessName: "Swift Logistics",
    businessType: "Transport",
    source: "Referral",
    serviceInterestedIn: "Vehicle branding",
    status: "Follow-Up Needed",
    dealValue: 2400,
    estimatedDealValue: 2400,
    birthday: "1984-09-10",
    notes: "Three delivery vans, wants durable vinyl and reflective safety details.",
    createdAt: "2026-04-29",
    lastContactedAt: "2026-05-09",
    nextFollowUpDate: "2026-05-15"
  },
  {
    id: "lead-3",
    name: "Ruvimbo Chikwanha",
    phone: "+263 78 112 0045",
    email: "ruvimbo@opalbeauty.co.zw",
    businessName: "Opal Beauty Lounge",
    businessType: "Beauty salon",
    source: "Instagram DM",
    serviceInterestedIn: "3D signage",
    status: "Negotiating",
    dealValue: 1250,
    estimatedDealValue: 1250,
    birthday: "1992-05-30",
    notes: "Asked for gold acrylic lettering and reception wall logo.",
    createdAt: "2026-05-07",
    lastContactedAt: "2026-05-17",
    nextFollowUpDate: "2026-05-20"
  },
  {
    id: "lead-4",
    name: "Farai Mandizha",
    phone: "+263 77 609 3312",
    email: "farai@mandizhalaw.co.zw",
    businessName: "Mandizha Legal Practice",
    businessType: "Professional services",
    source: "LinkedIn",
    serviceInterestedIn: "Reception wall branding",
    status: "New Lead",
    dealValue: 780,
    estimatedDealValue: 780,
    birthday: "1978-01-18",
    notes: "Downloaded brochure but has not been contacted yet.",
    createdAt: "2026-05-16",
    lastContactedAt: null,
    nextFollowUpDate: "2026-05-18"
  },
  {
    id: "lead-5",
    name: "Nyasha Dube",
    phone: "+263 73 500 9122",
    email: "nyasha@citygrill.co.zw",
    businessName: "City Grill Mutare",
    businessType: "Restaurant",
    source: "Website form",
    serviceInterestedIn: "Banners",
    status: "Quote Requested",
    dealValue: 640,
    estimatedDealValue: 640,
    birthday: "1990-12-02",
    notes: "Needs launch banners and menu board refresh.",
    createdAt: "2026-05-12",
    lastContactedAt: "2026-05-14",
    nextFollowUpDate: "2026-05-18"
  },
  {
    id: "lead-6",
    name: "Kudzai Matema",
    phone: "+263 71 221 8765",
    email: "kudzai@matematech.co.zw",
    businessName: "Matema Tech Repairs",
    businessType: "Electronics repair",
    source: "Walk-in",
    serviceInterestedIn: "Vinyl window graphics",
    status: "Contacted",
    dealValue: 520,
    estimatedDealValue: 520,
    birthday: "1986-05-04",
    notes: "Asked for privacy vinyl and opening hours on glass.",
    createdAt: "2026-05-01",
    lastContactedAt: "2026-05-02",
    nextFollowUpDate: "2026-05-10"
  },
  {
    id: "lead-7",
    name: "Anesu Makoni",
    phone: "+263 78 666 1400",
    email: "anesu@makonischool.ac.zw",
    businessName: "Makoni Junior School",
    businessType: "Education",
    source: "Email campaign",
    serviceInterestedIn: "Directional signs",
    status: "Won",
    dealValue: 3200,
    estimatedDealValue: 3200,
    birthday: "1981-07-14",
    notes: "Paid deposit for campus wayfinding package.",
    createdAt: "2026-04-10",
    lastContactedAt: "2026-02-11",
    nextFollowUpDate: "2026-05-18",
    isCustomer: true
  },
  {
    id: "lead-8",
    name: "Memory Zhou",
    phone: "+263 77 901 3319",
    email: "memory@zambezievents.co.zw",
    businessName: "Zambezi Events",
    businessType: "Events",
    source: "Referral",
    serviceInterestedIn: "Pull-up banners",
    status: "Lost",
    dealValue: 460,
    estimatedDealValue: 460,
    birthday: "1988-05-25",
    notes: "Went quiet after asking for cheaper banner options.",
    createdAt: "2026-03-18",
    lastContactedAt: "2026-03-29",
    nextFollowUpDate: "2026-05-18"
  },
  {
    id: "lead-9",
    name: "Simba Chari",
    phone: "+263 71 455 7820",
    email: "simba@charihardware.co.zw",
    businessName: "Chari Hardware",
    businessType: "Hardware retail",
    source: "Google search",
    serviceInterestedIn: "3D signage",
    status: "Quote Sent",
    dealValue: 2100,
    estimatedDealValue: 2100,
    birthday: "1979-10-09",
    notes: "Viewed sign mockup and asked if installation can be done Sunday.",
    createdAt: "2026-05-05",
    lastContactedAt: "2026-05-12",
    nextFollowUpDate: "2026-05-16"
  },
  {
    id: "lead-10",
    name: "Lisa Gumbo",
    phone: "+263 73 876 5521",
    email: "lisa@avonleahealth.co.zw",
    businessName: "Avonlea Health Clinic",
    businessType: "Healthcare",
    source: "WhatsApp referral",
    serviceInterestedIn: "Safety signs and vinyl",
    status: "Contacted",
    dealValue: 980,
    estimatedDealValue: 980,
    birthday: "1991-05-12",
    notes: "Existing customer due for clinic signage refresh.",
    createdAt: "2026-02-02",
    lastContactedAt: "2026-01-21",
    nextFollowUpDate: "2026-05-18",
    isCustomer: true
  }
];

export type FollowUpActivity = {
  id: string;
  leadId: string;
  type: "CALL" | "WHATSAPP" | "EMAIL" | "STAGE_CHANGE" | "QUOTE_CREATED" | "NOTE";
  title: string;
  note: string;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export const followUpActivities: FollowUpActivity[] = [
  { id: "act-1", leadId: "lead-1", type: "WHATSAPP", title: "Sent quote follow-up", note: "Asked Tariro if deposit can be confirmed before installation slots fill.", dueAt: "2026-05-18", completedAt: null, createdAt: "2026-05-17" },
  { id: "act-2", leadId: "lead-2", type: "CALL", title: "Call fleet manager", note: "Discuss vinyl durability and booking all three vans together.", dueAt: "2026-05-15", completedAt: null, createdAt: "2026-05-12" },
  { id: "act-3", leadId: "lead-3", type: "EMAIL", title: "Sent gold finish mockup", note: "Client viewed and asked about payment timing.", dueAt: "2026-05-20", completedAt: "2026-05-17", createdAt: "2026-05-15" },
  { id: "act-4", leadId: "lead-4", type: "WHATSAPP", title: "First response due", note: "Request logo, wall photo, and reception measurements.", dueAt: "2026-05-18", completedAt: null, createdAt: "2026-05-16" },
  { id: "act-5", leadId: "lead-9", type: "QUOTE_CREATED", title: "Quote created", note: "Sunday installation allowance included.", dueAt: "2026-05-16", completedAt: null, createdAt: "2026-05-12" }
];

export const quotes: Quote[] = [
  {
    id: "quote-1",
    leadId: "lead-1",
    clientName: "Tariro Moyo",
    businessName: "Harare Fresh Foods",
    quoteNumber: "CBS-2026-001",
    serviceCategory: "Shopfront branding",
    lineItems: [
      { id: "qli-1", description: "Illuminated shopfront sign", quantity: 1, unitPrice: 1450 },
      { id: "qli-2", description: "Window vinyl brand strip", quantity: 3, unitPrice: 150 }
    ],
    discount: 50,
    status: "Sent",
    notes: "Opening date is close; installation slot should be reserved after deposit.",
    terms: "60% deposit to confirm production. Balance due before installation.",
    createdAt: "2026-05-13",
    expiryDate: "2026-05-23"
  },
  {
    id: "quote-2",
    leadId: "lead-2",
    clientName: "Blessing Ncube",
    businessName: "Swift Logistics",
    quoteNumber: "CBS-2026-002",
    serviceCategory: "Vehicle branding",
    lineItems: [
      { id: "qli-3", description: "Full side vinyl branding", quantity: 3, unitPrice: 620 },
      { id: "qli-4", description: "Reflective safety decals", quantity: 3, unitPrice: 180 }
    ],
    discount: 0,
    status: "Follow-Up Due",
    notes: "Decision maker requested proof that vinyl will handle daily delivery routes.",
    terms: "50% deposit, production starts after artwork approval.",
    createdAt: "2026-05-09",
    expiryDate: "2026-05-19"
  },
  {
    id: "quote-3",
    leadId: "lead-3",
    clientName: "Ruvimbo Chikwanha",
    businessName: "Opal Beauty Lounge",
    quoteNumber: "CBS-2026-003",
    serviceCategory: "3D signage",
    lineItems: [
      { id: "qli-5", description: "Gold acrylic 3D letters", quantity: 1, unitPrice: 850 },
      { id: "qli-6", description: "Reception wall logo installation", quantity: 1, unitPrice: 250 }
    ],
    discount: 80,
    status: "Viewed",
    notes: "Client loves gold finish but is comparing payment timing.",
    terms: "Quote valid for 10 days. Deposit confirms material purchase.",
    createdAt: "2026-05-15",
    expiryDate: "2026-05-25"
  },
  {
    id: "quote-4",
    leadId: "lead-7",
    clientName: "Anesu Makoni",
    businessName: "Makoni Junior School",
    quoteNumber: "CBS-2026-004",
    serviceCategory: "Directional signs",
    lineItems: [
      { id: "qli-7", description: "Campus wayfinding signs", quantity: 12, unitPrice: 180 },
      { id: "qli-8", description: "Installation and site marking", quantity: 1, unitPrice: 680 }
    ],
    discount: 120,
    status: "Accepted",
    notes: "Deposit received; production queue confirmed.",
    terms: "Balance due before final installation day.",
    createdAt: "2026-04-22",
    expiryDate: "2026-05-22"
  },
  {
    id: "quote-5",
    leadId: "lead-9",
    clientName: "Simba Chari",
    businessName: "Chari Hardware",
    quoteNumber: "CBS-2026-005",
    serviceCategory: "3D signage",
    lineItems: [
      { id: "qli-9", description: "Large 3D exterior sign", quantity: 1, unitPrice: 1780 },
      { id: "qli-10", description: "Sunday installation allowance", quantity: 1, unitPrice: 320 }
    ],
    discount: 0,
    status: "Follow-Up Due",
    notes: "Follow up on Sunday installation availability and deposit.",
    terms: "60% deposit required to book Sunday installation team.",
    createdAt: "2026-05-12",
    expiryDate: "2026-05-20"
  }
];

export function quoteSubtotal(quote: Quote) {
  return quote.lineItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

export function quoteFinalTotal(quote: Quote) {
  return Math.max(quoteSubtotal(quote) - quote.discount, 0);
}

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
    title: "Shopfront Closeout Offer",
    template: "Offer email",
    audience: "Retail and restaurant leads",
    subject: "Make your shopfront work harder this month",
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
  { name: "3D signage", value: 32 },
  { name: "Shopfront branding", value: 27 },
  { name: "Vehicle branding", value: 21 },
  { name: "Banners and vinyl", value: 20 }
];



