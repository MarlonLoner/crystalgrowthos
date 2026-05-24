import { NextResponse } from "next/server";
import { getContentCalendarData } from "@/lib/db-data";
import { getContentSummary } from "@/lib/content-intelligence";

export const dynamic = "force-dynamic";

function groupCount(values: string[]) {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

export async function GET() {
  const data = await getContentCalendarData();
  const posts = data.posts.map((item) => ({
    ...item,
    summary: getContentSummary(item.post)
  }));

  return NextResponse.json({
    ok: true,
    source: data.source,
    totalContentPosts: data.posts.length,
    groupedByStatus: groupCount(data.posts.map((item) => item.post.status)),
    groupedByPlatform: groupCount(data.posts.map((item) => item.post.platform)),
    groupedByFormat: groupCount(data.posts.map((item) => item.post.format)),
    latestContentPosts: posts.slice(0, 20),
    posts
  });
}
