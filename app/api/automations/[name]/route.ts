import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const body = (await request.json()) as { enabled?: boolean };

  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
  }

  try {
    const automation = await prisma.automationRule.update({
      where: { name: decodeURIComponent(name) },
      data: { enabled: body.enabled }
    });

    return NextResponse.json({ automation });
  } catch {
    return NextResponse.json({ ok: true, mode: "mock", enabled: body.enabled });
  }
}
