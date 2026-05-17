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

- Dashboard metrics for leads, quotes, wins, follow-ups, scheduled posts, campaigns, and pipeline value
- Lead database with contact, business, status, birthday, notes, and next follow-up data
- Sales pipeline with moveable stages
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
