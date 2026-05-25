import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    warning: "These routes are for MVP diagnostics and should be protected or removed before broader production use.",
    routes: [
      "/api/debug/production",
      "/api/debug/proof",
      "/api/debug/proof/sync",
      "/api/debug/content",
      "/api/debug/communication",
      "/api/debug/scheduled-emails",
      "/api/debug/payments/[quoteId]",
      "/api/debug/quote-send/[id]",
      "/api/debug/quote-from-lead/[leadId]",
      "/api/debug/shopfront-submissions",
      "/api/debug/intake-leads",
      "/api/debug/mockups"
    ]
  });
}
