export function contentStatusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function contentPlatformLabel(platform: string) {
  return platform.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getContentSummary(post: { status: string; scheduledAt: string | null; publishedAt: string | null; platform: string; format: string }) {
  const now = new Date();
  const scheduled = post.scheduledAt ? new Date(post.scheduledAt) : null;
  const overdue = Boolean(scheduled && scheduled < now && post.status === "SCHEDULED");
  const readyToPublish = post.status === "READY" || overdue;

  let suggestedNextAction = "Draft content";
  if (post.status === "DRAFTED") suggestedNextAction = "Review and mark ready";
  if (post.status === "READY") suggestedNextAction = "Schedule or publish";
  if (post.status === "SCHEDULED") suggestedNextAction = overdue ? "Publish overdue scheduled post" : "Wait for scheduled publish date";
  if (post.status === "PUBLISHED") suggestedNextAction = "Track engagement and reuse proof";
  if (post.status === "ARCHIVED") suggestedNextAction = "No active content action";

  const priority = overdue ? "High" : readyToPublish ? "Medium" : post.status === "DRAFTED" ? "Medium" : "Low";

  return {
    statusLabel: contentStatusLabel(post.status),
    platformLabel: contentPlatformLabel(post.platform),
    suggestedNextAction,
    overdue,
    readyToPublish,
    priority,
    context: `${contentPlatformLabel(post.platform)} ${contentStatusLabel(post.format)}`
  };
}
