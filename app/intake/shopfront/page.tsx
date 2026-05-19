import Link from "next/link";
import { ImagePlus, Sparkles } from "lucide-react";
import { createShopfrontIntakeLeadAction } from "@/lib/actions";
import { buttonClass, inputClass } from "@/components/ui";

const styles = ["Premium and bold", "Clean and modern", "Bright and attention-grabbing", "Luxury retail", "Simple budget-friendly", "Not sure yet"];
const budgets = ["Under $300", "$300 - $500", "$500 - $1,000", "$1,000 - $2,000", "$2,000+", "Not sure yet"];
const urgency = ["Urgent - today", "This week", "This month", "Planning ahead", "Not sure yet"];

export default function ShopfrontIntakePage() {
  return (
    <main className="min-h-screen bg-obsidian px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="pt-6 lg:sticky lg:top-8">
          <Link href="/" className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-aurum">
            <span className="grid size-10 place-items-center rounded-lg border border-aurum/30 bg-aurum/10"><Sparkles size={20} /></span>
            Crystal Branding Studio
          </Link>
          <h1 className="mt-8 text-4xl font-black leading-tight sm:text-5xl">Upload your shopfront and logo for a free branding mockup.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-mercury">Share image links for your current shopfront and logo. We will review the opportunity and respond with the next step.</p>
          <div className="mt-8 rounded-lg border border-aurum/25 bg-aurum/10 p-4 text-sm leading-6 text-slate-200">
            <ImagePlus className="mb-3 text-aurum" size={22} />
            For now, paste image links from WhatsApp, Google Drive, Dropbox, or another shared location. Direct file storage can be added later with Cloudinary or Supabase Storage.
          </div>
        </section>

        <form action={createShopfrontIntakeLeadAction} className="rounded-lg border border-white/10 bg-graphite/85 p-5 shadow-glow backdrop-blur sm:p-6">
          <input type="hidden" name="source" value="Shopfront mockup form" />
          <input type="hidden" name="serviceInterestedIn" value="Shopfront branding mockup" />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-200">Name<input name="name" required className={`${inputClass} mt-2`} /></label>
            <label className="text-sm font-bold text-slate-200">Phone<input name="phone" required className={`${inputClass} mt-2`} placeholder="+263 77 661 7821" /></label>
            <label className="text-sm font-bold text-slate-200">Email<input name="email" required type="email" className={`${inputClass} mt-2`} /></label>
            <label className="text-sm font-bold text-slate-200">Business name<input name="businessName" required className={`${inputClass} mt-2`} /></label>
            <label className="text-sm font-bold text-slate-200">Business type<input name="businessType" className={`${inputClass} mt-2`} placeholder="Retail, restaurant, salon..." /></label>
            <label className="text-sm font-bold text-slate-200">Preferred style<select name="preferredStyle" className={`${inputClass} mt-2`}>{styles.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-200">Shopfront image URL<input name="shopfrontImageUrl" className={`${inputClass} mt-2`} placeholder="https://..." /></label>
            <label className="text-sm font-bold text-slate-200">Logo URL<input name="logoUrl" className={`${inputClass} mt-2`} placeholder="https://..." /></label>
            <label className="text-sm font-bold text-slate-200">Deadline<input name="deadline" type="date" className={`${inputClass} mt-2`} /></label>
            <label className="text-sm font-bold text-slate-200">Budget range<select name="budgetRange" className={`${inputClass} mt-2`}>{budgets.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-200">Urgency<select name="urgency" className={`${inputClass} mt-2`}>{urgency.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-200 sm:col-span-2">Notes<textarea name="notes" className={`${inputClass} mt-2 min-h-32`} placeholder="Tell us your location, target look, or what is wrong with the current shopfront." /></label>
          </div>
          <button type="submit" className={`${buttonClass} mt-5 w-full`}>Request free mockup</button>
          <Link href="/intake" className="mt-4 block text-center text-sm font-bold text-aurum hover:text-ember">Submit a general branding request</Link>
        </form>
      </div>
    </main>
  );
}
