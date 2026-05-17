import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "Crystal Growth OS",
    timestamp: new Date().toISOString()
  });
}
