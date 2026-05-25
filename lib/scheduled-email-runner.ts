import "server-only";

import { CommunicationChannel, CommunicationStatus, FollowUpActivityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-provider";

export type ScheduledEmailRunSummary = {
  ok: boolean;
  enabled: boolean;
  scanned: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: Array<{ communicationId: string; error: string }>;
  message?: string;
};

export function autoEmailEnabled() {
  return String(process.env.AUTO_EMAIL_ENABLED ?? "").toLowerCase() === "true";
}

function safeError(error: unknown) {
  return error instanceof Error ? error.message : "Scheduled email failed.";
}

export async function runScheduledEmailAutomation(batchSize = 10): Promise<ScheduledEmailRunSummary> {
  if (!autoEmailEnabled()) {
    return {
      ok: true,
      enabled: false,
      scanned: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      message: "Scheduled email automation disabled."
    };
  }

  const now = new Date();
  const dueCommunications = await prisma.communication.findMany({
    where: {
      channel: CommunicationChannel.EMAIL,
      status: CommunicationStatus.SCHEDULED,
      scheduledFor: { lte: now }
    },
    orderBy: [{ scheduledFor: "asc" }, { updatedAt: "asc" }],
    take: batchSize
  });

  const summary: ScheduledEmailRunSummary = {
    ok: true,
    enabled: true,
    scanned: dueCommunications.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  for (const communication of dueCommunications) {
    try {
      if (!communication.subject?.trim() || !communication.body.trim()) {
        const error = "Scheduled email is missing subject or body.";
        await prisma.communication.update({
          where: { id: communication.id },
          data: { status: CommunicationStatus.FAILED, failedAt: new Date(), error }
        });
        if (communication.leadId) {
          await prisma.followUpActivity.create({
            data: {
              leadId: communication.leadId,
              type: FollowUpActivityType.NOTE,
              title: "Scheduled email failed",
              note: error,
              completedAt: new Date()
            }
          });
        }
        summary.failed += 1;
        summary.errors.push({ communicationId: communication.id, error });
        continue;
      }

      const result = await sendEmail({
        to: communication.recipientEmail ?? "",
        subject: communication.subject,
        body: communication.body,
        replyTo: process.env.EMAIL_REPLY_TO,
        relatedId: communication.id
      });

      if (result.ok) {
        const sentAt = new Date();
        await prisma.communication.update({
          where: { id: communication.id },
          data: { status: CommunicationStatus.SENT, sentAt, failedAt: null, error: null }
        });
        if (communication.leadId) {
          await prisma.followUpActivity.create({
            data: {
              leadId: communication.leadId,
              type: FollowUpActivityType.NOTE,
              title: "Scheduled email sent",
              note: `Scheduled email sent: ${communication.subject}. Recipient: ${result.actualRecipient ?? communication.recipientEmail ?? "Not set"}${result.intendedRecipient && result.actualRecipient !== result.intendedRecipient ? ` (intended: ${result.intendedRecipient})` : ""}.`,
              completedAt: sentAt
            }
          });
        }
        summary.sent += 1;
      } else {
        const error = result.error ?? "Scheduled email failed.";
        await prisma.communication.update({
          where: { id: communication.id },
          data: { status: CommunicationStatus.FAILED, failedAt: new Date(), error }
        });
        if (communication.leadId) {
          await prisma.followUpActivity.create({
            data: {
              leadId: communication.leadId,
              type: FollowUpActivityType.NOTE,
              title: "Scheduled email failed",
              note: error,
              completedAt: new Date()
            }
          });
        }
        summary.failed += 1;
        summary.errors.push({ communicationId: communication.id, error });
      }
    } catch (error) {
      const message = safeError(error);
      await prisma.communication.update({
        where: { id: communication.id },
        data: { status: CommunicationStatus.FAILED, failedAt: new Date(), error: message }
      }).catch(() => null);
      summary.failed += 1;
      summary.errors.push({ communicationId: communication.id, error: message });
    }
  }

  return summary;
}
