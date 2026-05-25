import { NextRequest, NextResponse } from "next/server";
import { runScheduledEmailAutomation } from "@/lib/scheduled-email-runner";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");
  return auth === `Bearer ${secret}` || querySecret === secret;
}

async function handleCron(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized scheduled email request." }, { status: 401 });
  }

  const summary = await runScheduledEmailAutomation(10);
  return NextResponse.json(summary);
}

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}
