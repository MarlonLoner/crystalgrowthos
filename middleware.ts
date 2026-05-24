import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

const publicExact = new Set([
  "/login",
  "/intake",
  "/intake/shopfront",
  "/intake/thank-you",
  "/api/upload"
]);

function isPublicPath(pathname: string) {
  if (publicExact.has(pathname)) return true;
  if (pathname.startsWith("/q/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/images/") || pathname.startsWith("/public/")) return true;
  if (/\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|txt|xml|json|map)$/.test(pathname)) return true;
  return false;
}

function unauthorizedJson() {
  return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    if (pathname === "/login" && await verifyAuthToken(request.cookies.get(AUTH_COOKIE_NAME)?.value)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const authenticated = await verifyAuthToken(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  if (authenticated) return NextResponse.next();

  if (pathname.startsWith("/api/")) return unauthorizedJson();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
