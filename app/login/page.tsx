import { LockKeyhole, Mail } from "lucide-react";
import { buttonClass, inputClass } from "@/components/ui";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-graphite/90 p-6 shadow-glow">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-aurum">
            Crystal Growth OS
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">Marketing team sign in</h1>
          <p className="mt-2 text-sm leading-6 text-mercury">
            MVP email/password screen. Wire this to NextAuth credentials or your own session
            store before production use.
          </p>
        </div>
        <form className="space-y-4" action="/">
          <label className="block text-sm font-bold text-slate-200">
            Email
            <span className="relative mt-2 block">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                className={`${inputClass} pl-10`}
                defaultValue="admin@crystalbranding.studio"
                type="email"
              />
            </span>
          </label>
          <label className="block text-sm font-bold text-slate-200">
            Password
            <span className="relative mt-2 block">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input className={`${inputClass} pl-10`} defaultValue="crystal123" type="password" />
            </span>
          </label>
          <button className={`${buttonClass} w-full`} type="submit">
            Sign In
          </button>
        </form>
      </section>
    </main>
  );
}
