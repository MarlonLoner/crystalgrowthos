import Link from "next/link";
import { Sparkles } from "lucide-react";
import { createIntakeLeadAction } from "@/lib/actions";
import { buttonClass, inputClass } from "@/components/ui";

const services = ["3D signage", "Shopfront branding", "Vehicle branding", "Banners", "Vinyl graphics", "Logo refresh", "Full branding package"];
const budgets = ["Under $300", "$300 - $500", "$500 - $1,000", "$1,000 - $2,000", "$2,000+", "Not sure yet"];
const urgency = ["Urgent - today", "This week", "This month", "Planning ahead", "Not sure yet"];

export default function IntakePage() {
  return (
    <main className="min-h-screen bg-obsidian px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="pt-6 lg:sticky lg:top-8">
          <Link href="/" className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-aurum">
            <span className="grid size-10 place-items-center rounded-lg border border-aurum/30 bg-aurum/10"><Sparkles size={20} /></span>
            Crystal Branding Studio
          </Link>
          <h1 className="mt-8 text-4xl font-black leading-tight sm:text-5xl">Tell us what you want to brand. We will help you turn it into business visibility.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-mercury">Submit your signage, branding, or marketing request and the Crystal team will respond with the next practical step.</p>
          <div className="mt-8 grid gap-3 text-sm text-slate-300">
            <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4">Fast WhatsApp response for serious business inquiries.</p>
            <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4">Built for shopfronts, vehicles, events, offices, and campaigns.</p>
          </div>
        </section>

        <form action={createIntakeLeadAction} className="rounded-lg border border-white/10 bg-graphite/85 p-5 shadow-glow backdrop-blur sm:p-6">
          <input type="hidden" name="source" value="Website intake" />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-200">Name<input name="name" required className={`${inputClass} mt-2`} placeholder="Your name" /></label>
            <label className="text-sm font-bold text-slate-200">Phone<input name="phone" required className={`${inputClass} mt-2`} placeholder="+263 77 661 7821" /></label>
            <label className="text-sm font-bold text-slate-200">Email<input name="email" required type="email" className={`${inputClass} mt-2`} placeholder="you@business.com" /></label>
            <label className="text-sm font-bold text-slate-200">Business name<input name="businessName" required className={`${inputClass} mt-2`} placeholder="Your business" /></label>
            <label className="text-sm font-bold text-slate-200">Business type<input name="businessType" className={`${inputClass} mt-2`} placeholder="Salon, restaurant, retail, logistics..." /></label>
            <label className="text-sm font-bold text-slate-200">Service interested in<select name="serviceInterestedIn" required className={`${inputClass} mt-2`}>{services.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-200">Budget range<select name="budgetRange" className={`${inputClass} mt-2`}>{budgets.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-200">Urgency<select name="urgency" className={`${inputClass} mt-2`}>{urgency.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-200 sm:col-span-2">Notes<textarea name="notes" className={`${inputClass} mt-2 min-h-32`} placeholder="Tell us what you need, your location, measurements, deadline, or ideas." /></label>
          </div>
          <button type="submit" className={`${buttonClass} mt-5 w-full`}>Submit branding request</button>
          <p className="mt-4 text-center text-xs font-semibold text-slate-400">We use this information only to prepare a useful response and follow up on your branding request.</p>
          <Link href="/intake/shopfront" className="mt-4 block text-center text-sm font-bold text-aurum hover:text-ember">Need a shopfront mockup instead?</Link>
        </form>
      </div>
    </main>
  );
}
