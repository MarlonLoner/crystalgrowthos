"use server";

import { redirect } from "next/navigation";
import { setAuthCookie, verifyPassword } from "@/lib/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD) {
    return { error: "ADMIN_PASSWORD is not set. Add it to .env and Vercel before using the internal OS." };
  }

  if (!process.env.AUTH_SECRET && !process.env.SESSION_SECRET) {
    return { error: "AUTH_SECRET is not set. Add a secure random secret before using the internal OS." };
  }

  if (!(await verifyPassword(password))) {
    return { error: "Incorrect admin password." };
  }

  await setAuthCookie();
  redirect("/");
}
