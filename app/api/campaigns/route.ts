import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    title?: string;
    template?: string;
    audience?: string;
    subject?: string;
    body?: string;
  };

  if (!body.title || !body.template || !body.audience || !body.subject || !body.body) {
    return NextResponse.json({ error: "Missing campaign fields" }, { status: 400 });
  }

  try {
    const campaign = await prisma.emailCampaign.create({
      data: {
        title: body.title,
        template: body.template,
        audience: body.audience,
        subject: body.subject,
        body: body.body
      }
    });

    return NextResponse.json({ campaign });
  } catch {
    return NextResponse.json({
      campaign: {
        id: crypto.randomUUID(),
        title: body.title,
        template: body.template,
        audience: body.audience,
        subject: body.subject,
        status: "Draft"
      },
      mode: "mock"
    });
  }
}
