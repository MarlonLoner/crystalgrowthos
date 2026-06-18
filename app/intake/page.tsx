import Link from "next/link";
import { Sparkles } from "lucide-react";
import { IntakeForm } from "@/components/intake-form";

export default function IntakePage() {
  return (
    <main className="min-h-screen bg-obsidian px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="pt-6 lg:sticky lg:top-8">
          <Link href="/" className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-aurum">
            <span className="grid size-10 place-items-center rounded-lg border border-aurum/30 bg-aurum/10"><Sparkles size={20} /></span>
            Crystal Branding Studio
          </Link>
          <h1 className="mt-8 text-4xl font-black leading-tight sm:text-5xl">Branding, signage, and visibility enquiries.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-mercury">Tell us what you want to brand and we will respond with the next practical step, such as asset requests, measurements, quote guidance, or a follow-up call.</p>
          <div className="mt-8 grid gap-3 text-sm text-slate-300">
            <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4">Best for signage, vehicle branding, banners, vinyl, logo refreshes, and full branding packages.</p>
            <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4">Please prepare your logo, photos, rough sizes, location, deadline, and budget range if you have them.</p>
            <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4">For urgent requests, submit the form and use the WhatsApp button on the confirmation page.</p>
          </div>
        </section>
        <IntakeForm />
      </div>
    </main>
  );
}
