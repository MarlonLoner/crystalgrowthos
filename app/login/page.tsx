"use client";

import { useActionState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { buttonClass, inputClass } from "@/components/ui";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-graphite/90 p-6 shadow-glow">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-aurum">Crystal Growth OS</p>
          <h1 className="mt-2 text-3xl font-black text-white">Admin sign in</h1>
          <p className="mt-2 text-sm leading-6 text-mercury">Protected command center for Crystal Branding Studio operations, sales, production, proof, and content.</p>
        </div>
        <form className="space-y-4" action={formAction}>
          <label className="block text-sm font-bold text-slate-200">
            Admin password
            <span className="relative mt-2 block">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input className={`${inputClass} pl-10`} name="password" type="password" autoComplete="current-password" required />
            </span>
          </label>
          {state.error ? <p className="rounded-lg border border-red-300/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-100">{state.error}</p> : null}
          <button className={`${buttonClass} w-full`} type="submit" disabled={pending}>
            <ShieldCheck size={18} /> {pending ? "Checking..." : "Enter Crystal Growth OS"}
          </button>
          <p className="text-xs leading-5 text-mercury">Public intake and public quote pages remain accessible without logging in.</p>
        </form>
      </section>
    </main>
  );
}
