import { PrismaClient, LeadStatus, QuoteStatus, FollowUpActivityType } from "@prisma/client";

const prisma = new PrismaClient();

const leads = [
  ["lead-1", "Tariro Moyo", "+263 77 245 9011", "tariro@hararefresh.co.zw", "Harare Fresh Foods", "Retail grocery", "Facebook ad", "Shopfront branding", LeadStatus.QUOTE_SENT, "1850.00", "1989-05-23", "Needs illuminated shopfront signage before month-end opening.", "2026-05-03", "2026-05-13", "2026-05-18"],
  ["lead-2", "Blessing Ncube", "+263 71 843 2204", "blessing@swiftlogistics.co.zw", "Swift Logistics", "Transport", "Referral", "Vehicle branding", LeadStatus.FOLLOW_UP_NEEDED, "2400.00", "1984-09-10", "Three delivery vans, durable vinyl and reflective safety details.", "2026-04-29", "2026-05-09", "2026-05-15"],
  ["lead-3", "Ruvimbo Chikwanha", "+263 78 112 0045", "ruvimbo@opalbeauty.co.zw", "Opal Beauty Lounge", "Beauty salon", "Instagram DM", "3D signage", LeadStatus.NEGOTIATING, "1250.00", "1992-05-30", "Gold acrylic lettering and reception wall logo.", "2026-05-07", "2026-05-17", "2026-05-20"],
  ["lead-4", "Farai Mandizha", "+263 77 609 3312", "farai@mandizhalaw.co.zw", "Mandizha Legal Practice", "Professional services", "LinkedIn", "Reception wall branding", LeadStatus.NEW_LEAD, "780.00", "1978-01-18", "Downloaded brochure but has not been contacted yet.", "2026-05-16", null, "2026-05-18"],
  ["lead-5", "Nyasha Dube", "+263 73 500 9122", "nyasha@citygrill.co.zw", "City Grill Mutare", "Restaurant", "Website form", "Banners", LeadStatus.QUOTE_REQUESTED, "640.00", "1990-12-02", "Launch banners and menu board refresh.", "2026-05-12", "2026-05-14", "2026-05-18"],
  ["lead-6", "Kudzai Matema", "+263 71 221 8765", "kudzai@matematech.co.zw", "Matema Tech Repairs", "Electronics repair", "Walk-in", "Vinyl window graphics", LeadStatus.CONTACTED, "520.00", "1986-05-04", "Privacy vinyl and opening hours on glass.", "2026-05-01", "2026-05-02", "2026-05-10"],
  ["lead-7", "Anesu Makoni", "+263 78 666 1400", "anesu@makonischool.ac.zw", "Makoni Junior School", "Education", "Email campaign", "Directional signs", LeadStatus.WON, "3200.00", "1981-07-14", "Paid deposit for campus wayfinding package.", "2026-04-10", "2026-02-11", "2026-05-18"],
  ["lead-8", "Memory Zhou", "+263 77 901 3319", "memory@zambezievents.co.zw", "Zambezi Events", "Events", "Referral", "Pull-up banners", LeadStatus.LOST, "460.00", "1988-05-25", "Went quiet after asking for cheaper banner options.", "2026-03-18", "2026-03-29", "2026-05-18"],
  ["lead-9", "Simba Chari", "+263 71 455 7820", "simba@charihardware.co.zw", "Chari Hardware", "Hardware retail", "Google search", "3D signage", LeadStatus.QUOTE_SENT, "2100.00", "1979-10-09", "Viewed mockup and asked if Sunday installation is possible.", "2026-05-05", "2026-05-12", "2026-05-16"],
  ["lead-10", "Lisa Gumbo", "+263 73 876 5521", "lisa@avonleahealth.co.zw", "Avonlea Health Clinic", "Healthcare", "WhatsApp referral", "Safety signs and vinyl", LeadStatus.CONTACTED, "980.00", "1991-05-12", "Existing customer due for clinic signage refresh.", "2026-02-02", "2026-01-21", "2026-05-18"]
] as const;

const activitySeeds = [
  { leadId: "lead-1", type: FollowUpActivityType.WHATSAPP, title: "Sent quote follow-up", note: "Asked Tariro if deposit can be confirmed before installation slots fill.", dueAt: "2026-05-18", completedAt: null },
  { leadId: "lead-2", type: FollowUpActivityType.CALL, title: "Call fleet manager", note: "Discuss vinyl durability and booking all three vans together.", dueAt: "2026-05-15", completedAt: null },
  { leadId: "lead-3", type: FollowUpActivityType.EMAIL, title: "Sent gold finish mockup", note: "Client viewed and asked about payment timing.", dueAt: "2026-05-20", completedAt: "2026-05-17" },
  { leadId: "lead-4", type: FollowUpActivityType.WHATSAPP, title: "First response due", note: "Request logo, wall photo, and reception measurements.", dueAt: "2026-05-18", completedAt: null },
  { leadId: "lead-9", type: FollowUpActivityType.QUOTE_CREATED, title: "Quote created", note: "Sunday installation allowance included.", dueAt: "2026-05-16", completedAt: null }
] as const;
const quoteSeeds = [
  {
    leadId: "lead-1",
    quoteNumber: "CBS-2026-001",
    clientName: "Tariro Moyo",
    businessName: "Harare Fresh Foods",
    serviceCategory: "Shopfront branding",
    discount: "50.00",
    status: QuoteStatus.SENT,
    notes: "Reserve installation slot after deposit.",
    terms: "60% deposit to confirm production. Balance due before installation.",
    expiryDate: "2026-05-23",
    items: [["Illuminated shopfront sign", 1, "1450.00"], ["Window vinyl brand strip", 3, "150.00"]]
  },
  {
    leadId: "lead-2",
    quoteNumber: "CBS-2026-002",
    clientName: "Blessing Ncube",
    businessName: "Swift Logistics",
    serviceCategory: "Vehicle branding",
    discount: "0.00",
    status: QuoteStatus.FOLLOW_UP_DUE,
    notes: "Decision maker requested proof of vinyl durability.",
    terms: "50% deposit, production starts after artwork approval.",
    expiryDate: "2026-05-19",
    items: [["Full side vinyl branding", 3, "620.00"], ["Reflective safety decals", 3, "180.00"]]
  },
  {
    leadId: "lead-3",
    quoteNumber: "CBS-2026-003",
    clientName: "Ruvimbo Chikwanha",
    businessName: "Opal Beauty Lounge",
    serviceCategory: "3D signage",
    discount: "80.00",
    status: QuoteStatus.VIEWED,
    notes: "Client comparing payment timing.",
    terms: "Quote valid for 10 days. Deposit confirms material purchase.",
    expiryDate: "2026-05-25",
    items: [["Gold acrylic 3D letters", 1, "850.00"], ["Reception wall logo installation", 1, "250.00"]]
  },
  {
    leadId: "lead-7",
    quoteNumber: "CBS-2026-004",
    clientName: "Anesu Makoni",
    businessName: "Makoni Junior School",
    serviceCategory: "Directional signs",
    discount: "120.00",
    status: QuoteStatus.ACCEPTED,
    notes: "Deposit received; production queue confirmed.",
    terms: "Balance due before final installation day.",
    expiryDate: "2026-05-22",
    items: [["Campus wayfinding signs", 12, "180.00"], ["Installation and site marking", 1, "680.00"]]
  },
  {
    leadId: "lead-9",
    quoteNumber: "CBS-2026-005",
    clientName: "Simba Chari",
    businessName: "Chari Hardware",
    serviceCategory: "3D signage",
    discount: "0.00",
    status: QuoteStatus.FOLLOW_UP_DUE,
    notes: "Follow up on Sunday installation and deposit.",
    terms: "60% deposit required to book Sunday installation team.",
    expiryDate: "2026-05-20",
    items: [["Large 3D exterior sign", 1, "1780.00"], ["Sunday installation allowance", 1, "320.00"]]
  }
] as const;

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@crystalbranding.studio" },
    update: {},
    create: {
      name: "Crystal Admin",
      email: "admin@crystalbranding.studio",
      password: "crystal123-demo-only",
      role: "admin"
    }
  });

  for (const lead of leads) {
    const [id, name, phone, email, businessName, businessType, source, serviceInterestedIn, status, dealValue, birthday, notes, createdAt, lastContactedAt, nextFollowUpAt] = lead;
    await prisma.lead.upsert({
      where: { email },
      update: {
        name,
        phone,
        businessName,
        businessType,
        source,
        serviceInterestedIn,
        status,
        dealValue,
        estimatedDealValue: dealValue,
        birthday: new Date(birthday),
        notes,
        createdAt: new Date(createdAt),
        lastContactedAt: lastContactedAt ? new Date(lastContactedAt) : null,
        nextFollowUpDate: new Date(nextFollowUpAt),
        nextFollowUpAt: new Date(nextFollowUpAt)
      },
      create: {
        id,
        name,
        phone,
        email,
        businessName,
        businessType,
        source,
        serviceInterestedIn,
        status,
        dealValue,
        estimatedDealValue: dealValue,
        birthday: new Date(birthday),
        notes,
        createdAt: new Date(createdAt),
        lastContactedAt: lastContactedAt ? new Date(lastContactedAt) : null,
        nextFollowUpDate: new Date(nextFollowUpAt),
        nextFollowUpAt: new Date(nextFollowUpAt)
      }
    });
  }

  for (const quoteSeed of quoteSeeds) {
    const total = quoteSeed.items.reduce((sum, [, quantity, unitPrice]) => sum + quantity * Number(unitPrice), 0);
    const finalTotal = total - Number(quoteSeed.discount);

    await prisma.quote.upsert({
      where: { quoteNumber: quoteSeed.quoteNumber },
      update: {
        status: quoteSeed.status,
        total: total.toFixed(2),
        finalTotal: finalTotal.toFixed(2),
        notes: quoteSeed.notes
      },
      create: {
        leadId: quoteSeed.leadId,
        quoteNumber: quoteSeed.quoteNumber,
        clientName: quoteSeed.clientName,
        businessName: quoteSeed.businessName,
        serviceCategory: quoteSeed.serviceCategory,
        discount: quoteSeed.discount,
        total: total.toFixed(2),
        finalTotal: finalTotal.toFixed(2),
        status: quoteSeed.status,
        notes: quoteSeed.notes,
        terms: quoteSeed.terms,
        expiryDate: new Date(quoteSeed.expiryDate),
        lineItems: {
          create: quoteSeed.items.map(([description, quantity, unitPrice]) => ({
            description,
            quantity,
            unitPrice,
            total: (quantity * Number(unitPrice)).toFixed(2)
          }))
        }
      }
    });
  }

  await prisma.followUpActivity.deleteMany({});
  for (const activity of activitySeeds) {
    await prisma.followUpActivity.create({
      data: {
        leadId: activity.leadId,
        type: activity.type,
        title: activity.title,
        note: activity.note,
        dueAt: activity.dueAt ? new Date(activity.dueAt) : null,
        completedAt: activity.completedAt ? new Date(activity.completedAt) : null
      }
    });
  }
  const automations = [
    ["Birthday wishes", "Send warm birthday messages with a small loyalty offer.", "Lead birthday", "WhatsApp", true],
    ["Holiday messages", "Queue seasonal greetings and limited-time brand offers.", "Public holiday calendar", "Email", true],
    ["Quote follow-ups", "Follow up automatically three days after a quote is sent.", "Quote sent date", "WhatsApp", true],
    ["Review requests", "Ask won customers for public reviews after delivery.", "Deal won", "WhatsApp", false],
    ["Referral requests", "Invite happy customers to refer aligned businesses.", "Won customer check-in", "Email", false],
    ["Inactive customer revival", "Re-engage customers after 90 days of silence.", "No activity for 90 days", "WhatsApp", true]
  ] as const;

  for (const [name, description, trigger, channel, enabled] of automations) {
    await prisma.automationRule.upsert({
      where: { name },
      update: { description, trigger, channel, enabled },
      create: { name, description, trigger, channel, enabled }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });



