import { redirect } from "next/navigation";
import { clearAuthCookie } from "@/lib/auth";

export async function GET() {
  await clearAuthCookie();
  redirect("/login");
}
