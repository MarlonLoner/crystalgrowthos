import { NextResponse } from "next/server";
import { syncProofAssetsForCompletedJobsAction } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await syncProofAssetsForCompletedJobsAction();
  const proofAssetsAfterSync = await prisma.proofAsset.count();

  return NextResponse.json({
    ok: result.ok,
    message: result.message,
    jobsScanned: result.jobsScanned,
    createdCount: result.createdCount,
    existingCount: result.existingCount,
    proofAssetsAfterSync,
    syncedJobs: result.syncedJobs
  });
}
