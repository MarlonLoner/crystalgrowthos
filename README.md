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

## Mockup Production Board

Visit `/mockups` to manage shopfront mockup requests after assets are received. The board groups mockup leads into New Request, Needs Assets, Assets Received, In Design, Mockup Sent, Ready for Quote, Converted to Quote, and Dormant / Lost.

The workflow is inferred from uploaded `LeadAsset` records, related quotes, and `FollowUpActivity` titles such as `Mockup in design`, `Mockup sent`, and `Ready for quote`. Use the board or lead detail page to request missing assets, mark a mockup in design, mark it sent, and move the lead to ready for quote before creating a quote.

Manual test:
1. Submit `/intake/shopfront` with a shopfront image and logo.
2. Open `/mockups` and confirm the lead appears under Assets Received.
3. Click Mark In Design, then confirm it moves to In Design after refresh.
4. Click Mark Mockup Sent and confirm a pending Follow up on mockup activity is created.
5. Open `/money-today` and confirm mockup production actions appear.
6. Click Mark Ready for Quote, then create a quote from the same lead.
7. Open `/api/debug/mockups` to inspect inferred status, assets, activities, and related quotes.



## Deposit and Payment Tracking

Quotes now support payment tracking with deposit logic. Use the payment section on a quote detail page to record USD payments by cash, EcoCash, bank transfer, swipe, USD cash, or other method.

Crystal Growth OS calculates quote total, deposit required at 60%, amount paid, balance remaining, payment status, and the next suggested payment action. Recording a deposit can move the quote to Accepted, mark the lead as Won, create a Payment recorded activity, and create pending Begin production and Collect balance tasks. Recording the full balance marks the quote Paid.

Manual test:
1. Open a sent quote.
2. Record a deposit below the full quote value.
3. Confirm payment history appears on the quote.
4. Confirm lead detail shows payment history and outstanding balance.
5. Confirm Money Today shows Begin production or Collect balance.
6. Record the remaining balance and confirm the quote becomes Paid.
7. Open `/api/debug/payments/[quoteId]` to inspect payments and payment intelligence.

Migration:
- Local development: `npx prisma migrate dev`
- Production/Vercel database: `npx prisma migrate deploy`
- If using Neon SQL editor manually, run `prisma/migrations/202605230001_add_payments/migration.sql`.
## Review + Content Flywheel

Visit `/proof` to manage the proof engine: reviews, testimonials, referral requests, before/after posts, social posts, and case studies created from completed work.

When a production job is marked completed, Crystal Growth OS now creates pending review/content follow-up tasks and `ProofAsset` records for:

```text
REVIEW_REQUEST
BEFORE_AFTER
REFERRAL_REQUEST
```

Proof statuses:

```text
TODO
REQUESTED
RECEIVED
DRAFTED
PUBLISHED
ARCHIVED
```

The Proof Engine groups proof opportunities by status and provides actions to request a review, mark a review received, draft a social post, mark proof published, and ask for a referral. Lead detail pages show related proof opportunities, and Money Today highlights proof actions so completed jobs turn into trust-building marketing assets instead of disappearing after delivery.

Manual test:
1. Complete a production job from `/production`.
2. Confirm review/content follow-up tasks and proof assets are created.
3. Open `/proof` and confirm the proof cards appear under To Request.
4. Click Request Review, then Mark Review Received.
5. Click Draft Social Post and confirm the generated caption preview is visible.
6. Click Mark Published and Ask for Referral.
7. Confirm Money Today and lead detail reflect the updated proof state.
8. Open `/api/debug/proof` to inspect proof assets, suggested actions, content drafts, and recent activities.

Migration:
- Local development: `npx prisma migrate dev`
- Production/Vercel database: `npx prisma migrate deploy`
- If using Neon SQL editor manually, run `prisma/migrations/202605230003_add_proof_assets/migration.sql`.
## Production Job Workflow

Visit `/production` to manage production work after a quote reaches the deposit threshold. Recording a deposit of at least 60% automatically creates one `ProductionJob` for the quote, marks the lead as Won, logs `Production job created`, and creates a pending `Begin production` task.

Production statuses:

```text
READY_TO_START
DESIGN_ARTWORK
PRINTING_FABRICATION
INSTALLATION_SCHEDULED
INSTALLED_DELIVERED
AWAITING_BALANCE
COMPLETED
REVIEW_REQUESTED
CANCELLED
```

The production board groups jobs by status and shows the client, business, quote number, service category, quote value, amount paid, balance, priority, due date, installation date, and suggested next action. Use the board to start production, move artwork/design into fabrication, schedule installation, mark installed, request balance, mark completed, and request a review.

Production integrates back into lead detail, quote detail, Money Today, follow-ups, and revenue reporting. Completed jobs create pending tasks for review requests and before/after content.

Manual test:
1. Open a quote and record a deposit above 60%.
2. Confirm a production job is created and visible at `/production`.
3. Click Start Production, then Mark Design Approved, then Mark In Fabrication.
4. Schedule installation with a date and notes.
5. Mark Installed and confirm balance collection appears if money is still outstanding.
6. Record the remaining balance on the quote.
7. Mark Completed and confirm review/content tasks are created.
8. Open `/api/debug/production` to inspect jobs, payments, suggested actions, and related activities.

Migration:
- Local development: `npx prisma migrate dev`
- Production/Vercel database: `npx prisma migrate deploy`
- If using Neon SQL editor manually, run `prisma/migrations/202605230002_add_production_jobs/migration.sql`.
## Quote Print and Send Workflow

Quote detail pages include a send workflow with a generated WhatsApp message, a Mark Quote Sent action, and links to a print-friendly quote view. Open `/quotes/[id]/print` to view a clean white quote layout without dashboard navigation, then use the browser print dialog to save as PDF.

Public read-only quote links are available at `/q/[quoteNumber]` for a simple client-facing print view.

When Mark Quote Sent is clicked, Crystal Growth OS updates the quote to `SENT`, updates the related lead to `QUOTE_SENT`, creates a completed `Quote sent` WhatsApp activity, creates a pending `Follow up on quote` WhatsApp activity due tomorrow, and refreshes dashboard, lead, quote, Money Today, follow-up, and revenue report paths.

Manual test:
1. Create a quote from a lead.
2. Open the quote detail page.
3. Click Open Print View and use browser print/save as PDF.
4. Confirm all totals display in USD.
5. Click Mark Quote Sent.
6. Confirm quote status is `SENT` and the lead status is `QUOTE_SENT`.
7. Open `/api/debug/quote-send/[id]` and confirm quote-sent and pending follow-up records exist.
## Create Quote From Lead

Use `/quotes/new?leadId=LEAD_ID` to create a database-backed quote directly from a lead or mockup request. When a lead id is present, Crystal Growth OS loads the lead, assets, recent activities, and existing quotes, then pre-fills the quote form with client name, business name, service category, notes, default quote terms, and suggested editable line items.

This connects the mockup workflow to revenue: after a shopfront request is marked Ready for Quote, click Create Quote from the lead detail page or Mockups board, review the assets, adjust suggested pricing, and save the quote. Saving creates `Quote` and `QuoteLineItem` records, updates the lead status, and logs a `Quote created from lead` activity.

Manual test:
1. Submit `/intake/shopfront` with assets.
2. Open `/mockups`, mark the request In Design, Mockup Sent, then Ready for Quote.
3. Click Create Quote and confirm `/quotes/new?leadId=...` opens.
4. Confirm the form is prefilled and suggested line items are editable.
5. Save the quote and confirm it appears in `/quotes` and on the lead detail page.
6. Open `/api/debug/quote-from-lead/[leadId]` to verify lead, assets, suggested line items, existing quotes, and activities.
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

## Duplicate Intake Handling

Public intake uses normalized email as the identity key. If a new submission uses an email that already exists, Crystal Growth OS updates the existing lead instead of creating a duplicate or exposing a Prisma unique constraint error.

Repeat `/intake` submissions append a timestamped note, refresh the next follow-up date, and create a `Repeat intake submission` WhatsApp activity.

Repeat `/intake/shopfront` submissions attach any new shopfront/logo/reference assets to the same lead, append a timestamped note, and create `Repeat shopfront mockup request` plus `Review updated mockup assets` activities.
## Vercel Blob Asset Upload + Mockup Workflow

Shopfront mockup intake now supports direct image uploads using Vercel Blob. The app stores uploaded shopfront, logo, and reference files as `LeadAsset` records connected to the created lead.

Required environment variable:

```bash
BLOB_READ_WRITE_TOKEN="your-vercel-blob-read-write-token"
```

Routes and workflow:

```text
/intake/shopfront
/leads/[id]
/intake/inbox
/api/debug/assets/[leadId]
```

To test locally:

1. Add `BLOB_READ_WRITE_TOKEN` to `.env`.
2. Run `npm run dev`.
3. Open `/intake/shopfront`.
4. Submit a unique email with shopfront and logo files.
5. Confirm redirect to `/intake/thank-you`.
6. Open `/intake/inbox` and confirm asset count plus logo/shopfront status.
7. Open `/leads/[id]` and confirm the Asset Gallery shows uploaded files.
8. Open `/api/debug/assets/[leadId]` and confirm `assets` and related activities exist.
9. Open `/money-today` and confirm the shopfront mockup action appears.

Upload validation is intentionally simple for Vercel: JPG, JPEG, PNG, WEBP, and SVG images only, with an 8MB limit per file. URL fallback fields remain available for shared Drive/WhatsApp links.
## Currency

Crystal Growth OS displays monetary values in USD by default.

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
- `BLOB_READ_WRITE_TOKEN` for Vercel Blob shopfront/logo uploads

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













## Content Calendar + Publishing Queue

Crystal Growth OS now includes a proof-driven content calendar at `/content-calendar`. The Proof Engine can create real `ContentPost` drafts from review, testimonial, referral, before/after, and completed-project proof assets.

Content workflow:
- Open `/proof` and click `Create Content Draft` on a proof card.
- Open `/content-calendar` to review drafts grouped as Idea, Drafted, Ready, Scheduled, Published, and Archived.
- Mark posts ready, schedule them, mark them published, or archive them.
- Published content updates the related proof asset to `PUBLISHED` when linked.
- Money Today surfaces content actions for drafted, ready, due scheduled, and overdue scheduled posts.
- Lead detail pages show related content history.

Routes:
- `/content-calendar` - internal content board and publishing queue.
- `/api/debug/content` - debug view of content posts grouped by status, platform, and format.

Migration:
- `202605240001_add_content_posts` adds `ContentPost`, `ContentPlatform`, `ContentFormat`, and `ContentStatus`.

Manual test:
1. Complete a production job and confirm proof assets exist.
2. Open `/proof` and click `Create Content Draft`.
3. Open `/content-calendar` and confirm the draft appears.
4. Mark the draft ready, schedule it, then mark it published.
5. Confirm `/money-today`, `/proof`, and the related lead detail page reflect the content status.
6. Open `/api/debug/content` to inspect database-backed content records.

### Proof Backfill / Sync

If `/proof` is empty but `/api/debug/proof` shows completed or review-requested production jobs, run the MVP sync route:

```bash
/api/debug/proof/sync
```

This creates missing `ProofAsset` records for existing `COMPLETED` and `REVIEW_REQUESTED` production jobs without duplicating existing proof assets. It is a temporary admin/debug route for testing and should be protected or removed before wider production use.

## Command Center Polish + Data Health

Crystal Growth OS now includes a command-center refinement layer for presenting and trusting the full workflow:

Lead -> Assets -> Mockup -> Quote -> Payment -> Production -> Proof -> Content -> More leads.

Feature map:
- Dashboard `/` shows a Business Flow Snapshot and lifecycle strip across lead capture, mockups, quotes, payments, production, proof, and content.
- Money Today `/money-today` groups work into Sales Actions, Mockup Production Actions, Quote & Payment Actions, Production Actions, and Proof & Content Actions.
- System Health `/system-health` shows database status, core table counts, data-health warnings, and debug route links.
- Debug index `/api/debug` lists MVP diagnostic routes.
- Major boards now have clearer empty states explaining what belongs there and how records enter the page.

Demo/testing checklist:
1. Open `/` and confirm the flow snapshot and lifecycle strip load.
2. Open `/money-today` and confirm action groups are easy to scan.
3. Open `/system-health` and review counts and warnings.
4. Open `/api/debug` and confirm the debug route index appears.
5. Visit `/mockups`, `/production`, `/proof`, `/content-calendar`, `/follow-ups`, `/quotes`, `/leads`, and `/intake/inbox` with low data to confirm useful empty states.

Known limitations:
- User authentication is still MVP-level and should be hardened before broader production use.
- Debug routes, including `/api/debug/proof/sync`, need protection or removal before wider production use.
- Publishing is tracked internally; posts are not automatically pushed to social platforms yet.
- Payments are recorded manually.
- Proof sync is an admin/debug tool for backfilling completed jobs.

## Auth + Admin Protection

Crystal Growth OS now uses a simple MVP admin gate for internal routes. Public intake and public quote routes remain open, while the internal command center and debug routes require an admin session.

Required environment variables:

```bash
ADMIN_PASSWORD="replace-with-secure-admin-password"
AUTH_SECRET="replace-with-secure-random-secret"
```

Add both variables to `.env` locally and to Vercel project environment variables. `AUTH_SECRET` should be a long random string.

Public routes:
- `/login`
- `/intake`
- `/intake/shopfront`
- `/intake/thank-you`
- `/q/[quoteNumber]`
- `/api/upload`
- static assets and Next.js assets

Protected routes include:
- `/`
- `/money-today`
- `/system-health`
- `/leads`
- `/quotes`
- `/mockups`
- `/production`
- `/proof`
- `/content-calendar`
- `/follow-ups`
- `/reports` and `/reports/revenue`
- all `/api/debug/*` routes
- internal APIs such as campaigns, automations, and lead stage updates

Security limitations:
- This is a single-password MVP admin gate, not multi-user role-based auth.
- The session uses a signed httpOnly cookie with `AUTH_SECRET`.
- Rotate `ADMIN_PASSWORD` and `AUTH_SECRET` if either is exposed.
- Debug routes are now protected by middleware, but should still be removed or further restricted before broader production use.

## Feature Set 17: Smart Communication Automation Engine

Crystal Growth OS now includes a draft-first communication queue at `/communication`.

What it does:
- Creates deterministic WhatsApp/email-style client message drafts from workflow events.
- Groups messages by Draft, Ready, Scheduled, Sent, Failed, and Skipped.
- Supports Copy Message, Open WhatsApp, Mailto, Mark Ready, Mark Sent, and Skip.
- Keeps actual sending manual for MVP; no email provider is connected yet.

Automatic draft hooks are wired into:
- Public intake and shopfront/mockup intake.
- Missing asset and assets-received flows.
- Mockup in-design and mockup-sent flows.
- Quote created and quote sent flows.
- Payment received, production started, installation scheduled, balance reminder, job completed, review request, referral request, and content permission workflows.

Debug and health:
- `/api/debug/communication` shows communication counts by status, channel, and trigger.
- `/system-health` warns about old drafts, overdue scheduled messages, failed messages, and leads missing contact details.

Migration:
```bash
npx prisma migrate dev
npx prisma migrate deploy
```

Manual test checklist:
1. Submit `/intake` and confirm a NEW_LEAD draft appears in `/communication`.
2. Submit `/intake/shopfront` with and without assets and confirm ASSETS_RECEIVED or MISSING_ASSETS drafts.
3. Move a mockup into design and mark mockup sent; confirm related drafts.
4. Create/send a quote and record a payment; confirm quote/payment drafts.
5. Complete production or request review/referral; confirm proof communication drafts.
6. Use Copy Message, Open WhatsApp, Mailto, Mark Ready, Mark Sent, and Skip.

Remaining limitation: this layer is draft-first only. Real email/SMS sending can be connected later with a provider such as Resend or another transactional email service.

## Feature Set 17B: Communication Throttle + Best Next Message Logic

The communication engine now throttles draft creation so one client is not flooded with many active messages.

Rules:
- Same lead + trigger + channel drafts are blocked within 48 hours.
- A new Draft/Ready message is blocked if the same lead/channel already has an active message from the last 24 hours, unless the new trigger is high priority.
- Low-priority messages are suppressed when a higher-priority Draft/Ready message already exists for the same lead/channel.
- Suppressed messages are written as `INTERNAL_NOTE` + `SKIPPED` communication records so automation decisions stay auditable.

Priority examples:
- High: quote sent, payment received, installation scheduled, balance reminder, job completed.
- Medium: new lead, assets received, missing assets, mockup sent, production started, review request.
- Low: quote created, mockup in design, content permission, referral request.

The `/communication` page now groups messages as Needs Review, Ready to Send, Scheduled, Sent, and Skipped/Suppressed. It also highlights leads with multiple active drafts and offers cleanup to keep only the strongest next message.

## Feature Set 18: Email Sending Layer

Crystal Growth OS can now send approved EMAIL communications through Resend using an approve/send workflow.

Environment variables:
```bash
RESEND_API_KEY=""
EMAIL_FROM="Crystal Branding Studio <no-reply@yourdomain.com>"
EMAIL_REPLY_TO=""
EMAIL_TEST_MODE="true"
EMAIL_TEST_RECIPIENT=""
```

Recommended setup:
1. Verify your Resend sending domain, for example `mail.crystalbrandingstudio.com`.
2. Set `EMAIL_TEST_MODE=true` first.
3. Set `EMAIL_TEST_RECIPIENT` to your own inbox.
4. Create or find an EMAIL draft in `/communication`.
5. Click `Mark Ready`, then `Send Email`.
6. Confirm the test email arrives and includes the original intended recipient.
7. When ready for production, set `EMAIL_TEST_MODE=false` and confirm `EMAIL_FROM` uses the verified domain.

Behavior:
- Drafts are never auto-sent.
- Only EMAIL communications with DRAFT, READY, or SCHEDULED status can be sent.
- Success marks the communication SENT and logs an `Email sent` activity.
- Failure marks the communication FAILED with a safe error message.
- Mailto and Mark Sent remain available as manual fallbacks.

Remaining limitations:
- No inbound email handling yet.
- No unsubscribe/preferences yet.
- No bulk campaign sending yet.

### Contextual Email Draft Buttons

Production and follow-up screens can now create EMAIL drafts without sending them. These buttons are intentionally labeled as email draft actions:

- Production job email draft buttons choose the trigger from the job status, such as production started, installation scheduled, balance reminder, or review request.
- Follow-up email draft buttons infer a trigger from the follow-up reason, such as quote follow-up, deposit reminder, mockup follow-up, or review request.
- Contextual buttons never send email directly. They create or find a Communication Queue draft, where `Send Email` remains the only provider-send action.
## Feature Set 19: Scheduled Email Automation

Crystal Growth OS now supports scheduled email automation on top of the draft-first Communication Queue.

Safety rules:
- Only `EMAIL` communications are eligible for automatic scheduled sending.
- The cron runner only sends records where `status = SCHEDULED` and `scheduledFor <= now`.
- `DRAFT`, `READY`, `WHATSAPP`, `SMS`, and `INTERNAL_NOTE` communications are never auto-sent.
- `EMAIL_TEST_MODE=true` is still respected, so scheduled emails go to `EMAIL_TEST_RECIPIENT` first.
- If `AUTO_EMAIL_ENABLED` is not `true`, the cron endpoint returns a disabled response and sends nothing.

Environment variables:
```env
RESEND_API_KEY=""
EMAIL_FROM="Crystal Branding Studio <no-reply@yourdomain.com>"
EMAIL_REPLY_TO=""
EMAIL_TEST_MODE="true"
EMAIL_TEST_RECIPIENT=""
CRON_SECRET="replace-with-secure-cron-secret"
AUTO_EMAIL_ENABLED="false"
```

Routes:
- `/communication` schedules EMAIL drafts and still allows manual Send Email.
- `/api/cron/send-scheduled-emails` runs the scheduled sender and requires `Authorization: Bearer CRON_SECRET` or `?secret=CRON_SECRET`.
- `/api/debug/scheduled-emails` shows due, upcoming, failed, and recently sent scheduled emails without exposing secrets.

Vercel Cron:
`vercel.json` runs `/api/cron/send-scheduled-emails` every 15 minutes. Because Vercel Cron header configuration can vary by setup, the route also supports `?secret=` for MVP testing.

Manual test checklist:
1. Set `CRON_SECRET`, `AUTO_EMAIL_ENABLED=false`, `EMAIL_TEST_MODE=true`, and `EMAIL_TEST_RECIPIENT` in Vercel.
2. Open `/communication`, find an EMAIL draft, and schedule it a few minutes ahead.
3. Open `/api/debug/scheduled-emails` and confirm the item appears as upcoming or due.
4. Visit `/api/cron/send-scheduled-emails?secret=YOUR_SECRET` while disabled and confirm no email sends.
5. Set `AUTO_EMAIL_ENABLED=true`, redeploy, schedule another test email, and call the cron route again.
6. Confirm the test email arrives at `EMAIL_TEST_RECIPIENT` and the communication status becomes `SENT`.
7. Review `/system-health`, `/money-today`, and `/api/debug/scheduled-emails` for updated status.

Production checklist:
- Keep `EMAIL_TEST_MODE=true` until scheduled email delivery is confirmed.
- Confirm `EMAIL_FROM` uses a verified Resend domain, such as `mail.crystalbrandingstudio.com`.
- Use a strong `CRON_SECRET` and do not expose it publicly.
- Only set `EMAIL_TEST_MODE=false` after a successful test-mode run.
## Feature Set 20: Launch Readiness + Traffic Handling

Crystal Growth OS has a launch hardening layer for public traffic from Crystal Branding Studio.

Public routes:
- `/intake`
- `/intake/shopfront`
- `/intake/thank-you`
- `/q/[quoteNumber]`
- `/api/upload` for public shopfront uploads only

Protected/internal routes:
- Dashboard, Money Today, leads, quotes, mockups, production, proof, content calendar, reports, system health, communication queue, and all `/api/debug/*` routes require the admin gate.
- The scheduled email cron route is secret-protected by `CRON_SECRET` and still obeys `AUTO_EMAIL_ENABLED`.

Public intake hardening:
- Public forms now show clearer required/optional labels, expected next steps, privacy copy, and safe error messages.
- Forms include a honeypot field to reduce bot submissions.
- Basic in-memory rate limiting slows rapid repeated submissions by client/contact hints while preserving duplicate-safe lead updates.
- Duplicate emails update the existing lead and create repeat-submission activities rather than crashing.

Upload constraints:
- Accepted types: JPG, JPEG, PNG, WEBP, SVG.
- Maximum size: 8MB per file.
- Empty files, malformed files, unsafe filenames, and missing Blob configuration are rejected with public-safe messages.
- Uploaded asset metadata is filtered before creating `LeadAsset` records. URL fallbacks must be valid `http` or `https` URLs.

Communication safety:
- Intake still creates draft communication records where appropriate.
- Throttling/suppression remains active.
- DRAFT and READY emails are not auto-sent.
- Scheduled email automation only runs when `AUTO_EMAIL_ENABLED=true` and the communication is `EMAIL` + `SCHEDULED` + due.
- Review deterministic templates at `/communication/templates` before disabling `EMAIL_TEST_MODE` or enabling broader launch sending.

Monitoring:
- `/system-health` shows launch status: `READY`, `READY WITH WARNINGS`, or `NOT READY`.
- `/api/debug/launch-readiness` shows last-24-hour public submissions, repeat submissions, contact gaps, new-submission communications, upload constraints, and route/auth checks.
- `/api/debug` includes the launch readiness debug route.

Emergency fallback process:
1. Keep `EMAIL_TEST_MODE=true` during launch tests.
2. If uploads fail, prospects can still submit the form and send assets through WhatsApp from `/intake/thank-you`.
3. If public submission fails, ask prospects to WhatsApp `+263776617821` with their business name, service needed, and deadline.
4. Check `/system-health` and `/api/debug/launch-readiness` before promoting the forms.

Known limitations:
- Rate limiting is an MVP in-memory guard and is not a distributed anti-spam system.
- Upload failure counts are not persisted yet.
- Template launch approval is a static review label, not a database approval workflow.
- Public forms are optimized for capture and safety, not full campaign landing-page analytics yet.

