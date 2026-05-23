import { NextResponse } from "next/server";
import { getMockupBoardData } from "@/lib/db-data";
import { getMockupWorkflowItems } from "@/lib/mockup-workflow";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getMockupBoardData();
    const items = getMockupWorkflowItems(data.leads, data.assets, data.activities, data.quotes);

    return NextResponse.json({
      ok: true,
      source: data.source,
      counts: {
        leads: items.length,
        assets: data.assets.length,
        activities: data.activities.length,
        quotes: data.quotes.length
      },
      mockups: items.map(({ lead, workflow, assets, activities, quotes }) => {
        const prepareTasks = activities.filter((activity) => activity.title.toLowerCase().includes("prepare and send mockup"));
        const followUpTasks = activities.filter((activity) => activity.title.toLowerCase().includes("follow up on mockup"));
        const mockupSentActivities = activities.filter((activity) => activity.title.toLowerCase().includes("mockup sent"));

        return {
          lead,
          assetCount: assets.length,
          assets,
          inferredStatus: workflow.status,
          missingAssets: workflow.missingAssets,
          suggestedNextAction: workflow.suggestedNextAction,
          latestActivity: workflow.latestActivity,
          workflowDebug: {
            pendingPrepareTasksCount: prepareTasks.filter((activity) => !activity.completedAt).length,
            completedPrepareTasksCount: prepareTasks.filter((activity) => activity.completedAt).length,
            mockupSentActivityExists: mockupSentActivities.length > 0,
            pendingFollowUpOnMockupExists: followUpTasks.some((activity) => !activity.completedAt)
          },
          activities: activities.slice(0, 10),
          quotes
        };
      })
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown mockups debug error"
    }, { status: 500 });
  }
}