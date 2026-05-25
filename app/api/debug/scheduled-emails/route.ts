import { CommunicationChannel, CommunicationStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getEmailProviderStatus } from "@/lib/email-provider";
import { prisma } from "@/lib/prisma";
import { autoEmailEnabled } from "@/lib/scheduled-email-runner";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const [
    dueScheduled,
    upcomingScheduled,
    failedEmails,
    latestSent,
    latestFailed,
    nextDue
  ] = await Promise.all([
    prisma.communication.findMany({
      where: { channel: CommunicationChannel.EMAIL, status: CommunicationStatus.SCHEDULED, scheduledFor: { lte: now } },
      orderBy: { scheduledFor: "asc" },
      take: 25
    }),
    prisma.communication.count({
      where: { channel: CommunicationChannel.EMAIL, status: CommunicationStatus.SCHEDULED, scheduledFor: { gt: now } }
    }),
    prisma.communication.count({
      where: { channel: CommunicationChannel.EMAIL, status: CommunicationStatus.FAILED }
    }),
    prisma.communication.findMany({
      where: { channel: CommunicationChannel.EMAIL, status: CommunicationStatus.SENT },
      orderBy: { sentAt: "desc" },
      take: 10
    }),
    prisma.communication.findMany({
      where: { channel: CommunicationChannel.EMAIL, status: CommunicationStatus.FAILED },
      orderBy: { failedAt: "desc" },
      take: 10
    }),
    prisma.communication.findMany({
      where: { channel: CommunicationChannel.EMAIL, status: CommunicationStatus.SCHEDULED },
      orderBy: { scheduledFor: "asc" },
      take: 10
    })
  ]);

  return NextResponse.json({
    ok: true,
    autoEmailEnabled: autoEmailEnabled(),
    cronSecretConfigured: Boolean(process.env.CRON_SECRET),
    emailProvider: getEmailProviderStatus(),
    dueScheduledEmailCount: dueScheduled.length,
    upcomingScheduledEmailCount: upcomingScheduled,
    failedEmailCount: failedEmails,
    latestSentScheduledEmails: latestSent.map((item) => ({
      id: item.id,
      leadId: item.leadId,
      quoteId: item.quoteId,
      trigger: item.trigger,
      subject: item.subject,
      sentAt: item.sentAt,
      recipientEmail: item.recipientEmail
    })),
    latestFailedScheduledEmails: latestFailed.map((item) => ({
      id: item.id,
      leadId: item.leadId,
      quoteId: item.quoteId,
      trigger: item.trigger,
      subject: item.subject,
      failedAt: item.failedAt,
      error: item.error
    })),
    nextDueItems: nextDue.map((item) => ({
      id: item.id,
      leadId: item.leadId,
      quoteId: item.quoteId,
      trigger: item.trigger,
      subject: item.subject,
      scheduledFor: item.scheduledFor,
      status: item.status
    }))
  });
}
