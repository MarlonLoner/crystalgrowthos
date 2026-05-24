const encoder = new TextEncoder();

export const AUTH_COOKIE_NAME = "crystal_growth_os_session";
const SESSION_DAYS = 7;

type CookieStore = {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options?: Record<string, unknown>): void;
  delete(name: string): void;
};

function secret() {
  return process.env.AUTH_SECRET || process.env.SESSION_SECRET || "";
}

function bytesToBase64Url(bytes: ArrayBuffer) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return result === 0;
}

export function authProtectionConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && secret());
}

export async function verifyPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !secret()) return false;
  return timingSafeEqual(password, expected);
}

export async function createAuthToken() {
  if (!secret()) throw new Error("AUTH_SECRET or SESSION_SECRET is required for admin sessions.");
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `admin.${expiresAt}`;
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function verifyAuthToken(token?: string | null) {
  if (!token || !secret()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expiresAtText, signature] = parts;
  if (role !== "admin") return false;
  const expiresAt = Number(expiresAtText);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expected = await sign(`${role}.${expiresAtText}`);
  return timingSafeEqual(signature, expected);
}

async function cookieStore(): Promise<CookieStore> {
  const { cookies } = await import("next/headers");
  return await cookies();
}

export async function setAuthCookie() {
  const store = await cookieStore();
  store.set(AUTH_COOKIE_NAME, await createAuthToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60
  });
}

export async function clearAuthCookie() {
  const store = await cookieStore();
  store.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function isAuthenticated() {
  const store = await cookieStore();
  return verifyAuthToken(store.get(AUTH_COOKIE_NAME)?.value);
}

export async function requireAuth() {
  if (!(await isAuthenticated())) throw new Error("Authentication required");
}
