"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  completeFollowUpActivityAction,
  markLeadContactedAction,
  markMockupInDesignAction,
  markMockupSentAction,
  markReadyForQuoteAction,
  requestMissingAssetsAction,
  startProductionAction,
  markDesignArtworkAction,
  markPrintingFabricationAction,
  markInstalledDeliveredAction,
  requestBalanceAction,
  markProductionCompletedAction,
  requestReviewAction,
  scheduleFollowUpTomorrowAction,
  updateQuoteStatusAction
} from "@/lib/actions";

export function ActionButton({
  children,
  className,
  leadId,
  quoteId,
  activityId,
  note,
  action,
  quoteStatus,
  jobId
}: {
  children: React.ReactNode;
  className: string;
  leadId?: string;
  quoteId?: string;
  activityId?: string;
  note?: string;
  action: "mark-contacted" | "complete-follow-up" | "quote-status" | "schedule-quote-follow-up" | "mockup-in-design" | "mockup-sent" | "ready-for-quote" | "request-missing-assets" | "start-production" | "design-artwork" | "printing-fabrication" | "installed-delivered" | "request-balance" | "production-completed" | "request-review";
  quoteStatus?: "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "PAID";
  jobId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  function runAction() {
    setMessage("");
    startTransition(async () => {
      try {
        const result = action === "mark-contacted" && leadId
          ? await markLeadContactedAction(leadId)
          : action === "complete-follow-up" && leadId
            ? await completeFollowUpActivityAction({ leadId, activityId, note })
            : action === "quote-status" && quoteId && quoteStatus
              ? await updateQuoteStatusAction(quoteId, quoteStatus)
              : action === "schedule-quote-follow-up" && quoteId
                ? await scheduleFollowUpTomorrowAction(quoteId)
                : action === "mockup-in-design" && leadId
                ? await markMockupInDesignAction(leadId)
                : action === "mockup-sent" && leadId
                  ? await markMockupSentAction(leadId)
                  : action === "ready-for-quote" && leadId
                    ? await markReadyForQuoteAction(leadId)
                    : action === "request-missing-assets" && leadId
                      ? await requestMissingAssetsAction(leadId)
                      : action === "start-production" && jobId
                        ? await startProductionAction(jobId)
                        : action === "design-artwork" && jobId
                          ? await markDesignArtworkAction(jobId)
                          : action === "printing-fabrication" && jobId
                            ? await markPrintingFabricationAction(jobId)
                            : action === "installed-delivered" && jobId
                              ? await markInstalledDeliveredAction(jobId)
                              : action === "request-balance" && jobId
                                ? await requestBalanceAction(jobId)
                                : action === "production-completed" && jobId
                                  ? await markProductionCompletedAction(jobId)
                                  : action === "request-review" && jobId
                                    ? await requestReviewAction(jobId)
                                    : { ok: false, message: "Missing action data" };

        if (result.ok) {
          setMessage(result.message ?? "Saved to database");
          router.refresh();
        } else {
          setMessage(`Failed to save: ${"error" in result ? result.error : result.message ?? "Unknown error"}`);
        }
      } catch {
        setMessage("Action failed. Check database connection and try again.");
      }
    });
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button type="button" onClick={runAction} disabled={isPending} className={className}>
        {isPending ? "Working..." : children}
      </button>
      {message ? <span className="text-[11px] font-bold text-aurum">{message}</span> : null}
    </span>
  );
}





