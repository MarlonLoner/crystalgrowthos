import { PrismaClient, LeadStatus } from "@prisma/client";

const prisma = new PrismaClient();

const leads = [
  {
    name: "Amara Dlamini",
    phone: "+27 71 555 0101",
    email: "amara@luminaevents.co.za",
    businessName: "Lumina Events",
    businessType: "Events",
    source: "Instagram DM",
    serviceInterestedIn: "Corporate gifting",
    status: LeadStatus.QUOTE_SENT,
    dealValue: "42000.00",
    birthday: new Date("1991-08-12"),
    notes: "Needs premium welcome packs before conference season.",
    createdAt: new Date("2026-05-02"),
    nextFollowUpDate: new Date("2026-05-19")
  },
  {
    name: "Jason Pillay",
    phone: "+27 82 555 0112",
    email: "jason@northstarfitness.co.za",
    businessName: "Northstar Fitness",
    businessType: "Health and wellness",
    source: "Website form",
    serviceInterestedIn: "Branded activewear",
    status: LeadStatus.NEGOTIATING,
    dealValue: "68500.00",
    birthday: new Date("1988-11-03"),
    notes: "Comparing hoodie and gym towel packages.",
    createdAt: new Date("2026-05-05"),
    nextFollowUpDate: new Date("2026-05-17")
  },
  {
    name: "Mia Jacobs",
    phone: "+27 83 555 0198",
    email: "mia@solacafe.co.za",
    businessName: "Sola Cafe",
    businessType: "Hospitality",
    source: "Referral",
    serviceInterestedIn: "Uniform branding",
    status: LeadStatus.WON,
    dealValue: "27500.00",
    birthday: new Date("1994-02-21"),
    notes: "Won via referral. Ask for Google review after delivery.",
    createdAt: new Date("2026-04-27"),
    nextFollowUpDate: new Date("2026-06-03")
  },
  {
    name: "Thabo Mokoena",
    phone: "+27 79 555 0144",
    email: "thabo@apexlegal.africa",
    businessName: "Apex Legal Africa",
    businessType: "Professional services",
    source: "LinkedIn",
    serviceInterestedIn: "Executive notebooks",
    status: LeadStatus.FOLLOW_UP_NEEDED,
    dealValue: "19800.00",
    birthday: new Date("1982-06-30"),
    notes: "Requested quote revisions with black foil finish.",
    createdAt: new Date("2026-05-09"),
    nextFollowUpDate: new Date("2026-05-18")
  },
  {
    name: "Leah Naidoo",
    phone: "+27 76 555 0131",
    email: "leah@cobalttech.io",
    businessName: "Cobalt Tech",
    businessType: "Technology",
    source: "Webinar",
    serviceInterestedIn: "Launch merchandise",
    status: LeadStatus.NEW_LEAD,
    dealValue: "88000.00",
    birthday: new Date("1990-01-15"),
    notes: "High-value launch kit opportunity.",
    createdAt: new Date("2026-05-13"),
    nextFollowUpDate: new Date("2026-05-20")
  },
  {
    name: "Zara Petersen",
    phone: "+27 74 555 0172",
    email: "zara@freshcart.co.za",
    businessName: "FreshCart Grocers",
    businessType: "Retail",
    source: "Facebook ad",
    serviceInterestedIn: "Reusable shopper bags",
    status: LeadStatus.LOST,
    dealValue: "34000.00",
    birthday: new Date("1987-09-18"),
    notes: "Budget paused until Q3.",
    createdAt: new Date("2026-04-19"),
    nextFollowUpDate: new Date("2026-07-01")
  }
];

const automations = [
  ["Birthday wishes", "Send warm birthday messages with a small loyalty offer.", "Lead birthday", "WhatsApp", true],
  ["Holiday messages", "Queue seasonal greetings and limited-time brand offers.", "Public holiday calendar", "Email", true],
  ["Quote follow-ups", "Follow up automatically three days after a quote is sent.", "Quote sent date", "Email", true],
  ["Review requests", "Ask won customers for public reviews after delivery.", "Deal won", "WhatsApp", false],
  ["Referral requests", "Invite happy customers to refer aligned businesses.", "Won customer check-in", "Email", false],
  ["Inactive customer revival", "Re-engage customers after 90 days of silence.", "No activity for 90 days", "Email", true]
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
    await prisma.lead.upsert({
      where: { email: lead.email },
      update: lead,
      create: lead
    });
  }

  for (const [name, description, trigger, channel, enabled] of automations) {
    await prisma.automationRule.upsert({
      where: { name },
      update: { description, trigger, channel, enabled },
      create: { name, description, trigger, channel, enabled }
    });
  }

  await prisma.emailCampaign.createMany({
    data: [
      {
        title: "May Welcome Sequence",
        template: "Welcome sequence",
        audience: "New leads from web forms",
        subject: "Welcome to Crystal Branding Studio",
        body: "A short, premium introduction to how Crystal turns branded products into repeatable growth moments."
      },
      {
        title: "Conference Season Offer",
        template: "Offer email",
        audience: "Events and professional services leads",
        subject: "Brand moments your guests keep",
        body: "Positioning premium gifting bundles for upcoming conferences and team events."
      }
    ],
    skipDuplicates: true
  });
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
