# Crystal Growth OS

Internal AI-powered marketing department dashboard for Crystal Branding Studio.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Simple MVP email/password login screen
- OpenAI API integration placeholder
- Recharts analytics

## MVP Modules

- Dashboard metrics for leads, quote value, wins, overdue follow-ups, dormant customers, campaigns, and pipeline value
- Lead database with contact, business, status, birthday, notes, source, deal value, estimated value, and next follow-up data
- Lead management pages for list, create, detail, and edit workflows
- Public intake forms for website leads and shopfront mockup requests
- Intake Inbox for responding to new website and high-urgency leads
- WhatsApp execution actions with Zimbabwe phone formatting and wa.me links
- Money Today revenue command center for the actions worth chasing now
- Revenue Intelligence calculations for quote value, close rates, source quality, and top opportunities
- Revenue Report route for pipeline quality and money movement
- Sales pipeline with moveable stages
- Follow-Up Queue for daily money actions
- Quote Builder with quote list, create, edit, detail, and PDF-style preview screens
- WhatsApp Script Generator for first responses, quote follow-ups, payment reminders, approvals, reviews, referrals, and revival messages
- Content engine with placeholder AI copy outputs
- Email campaign engine with draft-saving API route
- Automation center with toggleable rules
- Monthly reports with Recharts analytics
- AI Strategy Assistant panel prepared for OpenAI integration

## Getting Started

1. Use Node 22:

```bash
nvm use
```

2. Install dependencies:

```bash
npm install
```

3. Create an environment file:

```bash
cp .env.example .env
```

4. Set `DATABASE_URL` to a PostgreSQL database.

5. Generate Prisma Client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

6. Seed demo data:

```bash
npm run prisma:seed
```

7. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Lead Intake + Website Capture

Crystal Growth OS now includes public lead capture routes that create real PostgreSQL leads and first-response follow-up activities.

Public routes:

```text
/intake
/intake/shopfront
/intake/thank-you
```

Internal route:

```text
/intake/inbox
```

Use `/intake` for general branding, signage, vehicle branding, vinyl, banner, and logo inquiries. Use `/intake/shopfront` for the free shopfront mockup offer. The shopfront form accepts image/logo URLs for now; real file upload storage can be added later with Cloudinary or Supabase Storage.

To test public intake locally:

1. Start the app with `npm run dev`.
2. Open `/intake` and submit a test lead.
3. Confirm redirect to `/intake/thank-you`.
4. Open `/leads` and confirm the lead exists.
5. Open `/follow-ups` and confirm the first-response activity exists.
6. Open `/money-today` and confirm the new lead appears.

To test shopfront mockup intake:

1. Open `/intake/shopfront`.
2. Submit a request with shopfront/logo URLs or notes.
3. Open `/intake/inbox`.
4. Confirm the request appears with urgency, source, suggested next action, WhatsApp action, View Lead, and Create Quote buttons.

The Intake Inbox reads PostgreSQL first and shows a fallback warning if demo data is being used because the database is unavailable.
## Real Action Persistence

Crystal Growth OS now persists key sales actions through App Router server actions.

Test lead creation and editing:

```text
/leads/new
/leads/lead-1/edit
```

Creating a lead writes a real `Lead` record and redirects to the new lead detail page. Editing a lead updates the real record and redirects back to that lead.

Test contact and follow-up completion:

```text
/leads/lead-1
/follow-ups
/money-today
```

Use Mark Contacted to update `lastContactedAt`, set the next follow-up date, and create a completed `FollowUpActivity`. Use Mark Done on follow-up activity rows to complete an existing activity or create a completed activity for generated action items.

Test quote status updates:

```text
/quotes/quote-1
```

The quote detail page can mark a quote as Sent, Viewed, Accepted, Rejected, or Paid. Sent quotes move the related lead to Quote Sent and schedule follow-up. Accepted or Paid quotes move the lead to Won. Rejected quotes move the lead to Lost. Set Follow-up for Tomorrow creates a `WHATSAPP` follow-up activity.

After actions, affected routes are revalidated: `/leads`, `/follow-ups`, `/money-today`, `/quotes`, quote detail, lead detail, revenue report, and the dashboard.
## Money Today + Revenue Intelligence

Visit `/money-today` for the daily revenue command center. It shows follow-ups due today, overdue follow-ups, new leads not contacted, quotes waiting for response, highest-value open opportunities, dormant customers, birthdays this month, suggested WhatsApp actions, and a mocked AI Revenue Brief.

The Money Today table scores each action as High, Medium, or Low priority using estimated deal value, quote value, lead status, quote status, days since last contact, overdue follow-ups, pending quotes, and service category. Each row includes Copy Message, Open WhatsApp, View Lead, Create Quote, View Quote, and a mock Mark Done action.

Visit `/reports/revenue` for the revenue report. It shows total leads, new leads this month, quote counts by status, pending/won/lost quote value, average quote value, lead-to-quote rate, quote acceptance rate, quote-to-win rate, best lead source, best service category, and the top 5 open opportunities.

This layer helps the team start each day with a short list of money actions instead of browsing admin screens.
## Lead Capture + WhatsApp Execution

Visit `/leads` to manage the lead list. Use `/leads/new` to capture a new opportunity, `/leads/lead-1` to inspect a lead, and `/leads/lead-1/edit` to test the edit form.

Lead detail pages show full lead information, related quotes, follow-up activities, suggested next action, generated WhatsApp scripts, and quick CTAs for quote creation, editing, marking contacted, copying messages, and opening WhatsApp.

WhatsApp actions safely format Zimbabwe phone numbers into `wa.me` links. They support numbers such as `+263 77 245 9011`, `0772459011`, and `772459011`, then encode the generated message for direct sending.

Quote detail pages include a quote send flow with a generated WhatsApp message, copy/open buttons, a mock Mark Quote Sent action, and a mock Set Follow-up for Tomorrow action.
## Money Execution Layer

### Follow-Up Queue

Visit `/follow-ups` to test the daily sales command center. The queue shows leads not contacted yet, follow-ups due today, overdue follow-ups, quotes sent but not accepted, dormant customers, and birthday messages due this month.

Use the quick actions to generate mock WhatsApp or email messages, mark contacted, move stage, or start a quote. The WhatsApp script generator includes short Zimbabwean-business friendly scripts for first response, shopfront/logo requests, quote follow-up, payment reminder, design approval, installation scheduling, review request, referral request, and dead lead revival.

### Quote Builder

Visit `/quotes` to test the quote list. Use `/quotes/new` to open the create quote form. Open any quote detail page, such as `/quotes/quote-1`, to view the clean PDF-style quote preview. Use `/quotes/quote-1/edit` to test the edit form.

The quote model supports client/lead, business name, quote number, service category, line items, quantity, unit price, totals, discount, final total, status, notes, terms, created date, and expiry date.

## Database

The Prisma schema uses PostgreSQL with `DATABASE_URL`. Production deployment should use a hosted PostgreSQL database such as Neon or Supabase.

Run production migrations with:

```bash
npx prisma migrate deploy
```

Seed data includes 10 Crystal Branding Studio leads, 5 quotes, signage and branding services, overdue follow-ups, quote follow-ups, dormant customers, and birthdays due this month.

## Vercel Deployment

1. Install dependencies locally:

```bash
npm install
```

2. Generate Prisma Client:

```bash
npm run prisma:generate
```

3. Run the TypeScript check:

```bash
npx tsc --noEmit
```

4. Build locally:

```bash
npm run build
```

5. Create a production PostgreSQL database with Neon, Supabase, or another hosted Postgres provider.

6. Add these Vercel environment variables:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `OPENAI_API_KEY` only when the OpenAI integration is connected; mock AI outputs work without it

7. Deploy on Vercel.

8. Run production migrations:

```bash
npx prisma migrate deploy
```

The project is locked to Node 22 through `package.json` engines and `.nvmrc`.

## Demo Login

The seed creates this user for a future credentials auth implementation:

- Email: `admin@crystalbranding.studio`
- Password: `crystal123`

The current `/login` page is an MVP screen and redirects into the dashboard without enforcing sessions.

## OpenAI Placeholder

`lib/openai.ts` exposes `getOpenAIClient()` and a placeholder strategy recommendation function. `OPENAI_API_KEY` is optional for now because the AI outputs are mocked. Add it when replacing mock recommendations with a prompt that summarizes leads, campaigns, reports, and automation state.

## Prisma Models

- `User`
- `Lead`
- `ContentBrief`
- `EmailCampaign`
- `AutomationRule`
- `FollowUp`
- `Quote`
- `QuoteLineItem`
- `FollowUpActivity`

The UI uses seed-shaped mock data so it remains browsable before PostgreSQL is running. API routes are already structured to persist updates when the database is connected.

## Troubleshooting

### Windows SWC Binary Error

If local `npm run dev` or `npm run build` fails with a message like `@next/swc-win32-x64-msvc is not a valid Win32 application` or `Failed to load SWC binary for win32/x64`, use Node 22 LTS and reinstall dependencies cleanly.

```bash
node -v
nvm install 22
nvm use 22
```

Then delete generated dependency/build folders and reinstall:

```bash
rm -rf node_modules package-lock.json .next
npm install
npm run prisma:generate
npm run build
```

On Windows PowerShell, use:

```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json, .next
npm install
npm run prisma:generate
npm run build
```

This SWC issue is environment-specific and should not require rewriting the app.





