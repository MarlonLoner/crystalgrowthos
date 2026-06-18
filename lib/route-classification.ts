export const publicLaunchRoutes = [
  "/intake",
  "/intake/shopfront",
  "/intake/thank-you",
  "/q/[quoteNumber]",
  "/api/upload"
] as const;

export const protectedLaunchRoutes = [
  "/",
  "/money-today",
  "/system-health",
  "/leads",
  "/quotes",
  "/mockups",
  "/production",
  "/proof",
  "/content-calendar",
  "/follow-ups",
  "/reports/revenue",
  "/communication",
  "/api/debug/*"
] as const;

export function classifyLaunchRoute(pathname: string) {
  if (["/intake", "/intake/shopfront", "/intake/thank-you", "/api/upload"].includes(pathname)) return "public";
  if (pathname.startsWith("/q/")) return "public";
  if (pathname.startsWith("/api/debug")) return "protected";
  return "protected";
}
