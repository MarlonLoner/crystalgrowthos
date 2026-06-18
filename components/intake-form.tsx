"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createIntakeLeadAction } from "@/lib/actions";
import { buttonClass, inputClass } from "@/components/ui";

const services = ["3D signage", "Shopfront branding", "Vehicle branding", "Banners", "Vinyl graphics", "Logo refresh", "Full branding package"];
const budgets = ["Under $300", "$300 - $500", "$500 - $1,000", "$1,000 - $2,000", "$2,000+", "Not sure yet"];
const urgency = ["Urgent - today", "This week", "This month", "Planning ahead", "Not sure yet"];

export function IntakeForm() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      const result = await createIntakeLeadAction(formData);
      if (result && !result.ok) setMessage(result.message);
    });
  }

  return (
    <form action={submit} className="rounded-lg border border-white/10 bg-graphite/85 p-5 shadow-glow backdrop-blur sm:p-6">
      <input type="hidden" name="source" value="Website intake" />
      <input type="text" name="companyWebsite" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="mb-5 rounded-lg border border-aurum/20 bg-aurum/10 p-4 text-sm leading-6 text-slate-200">
        Tell us what you need and we will reply with the next practical step. Fields marked required help us respond accurately.
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-200">Name <span className="text-aurum">required</span><input name="name" className={`${inputClass} mt-2`} placeholder="Your name" /></label>
        <label className="text-sm font-bold text-slate-200">Phone <span className="text-aurum">required</span><input name="phone" className={`${inputClass} mt-2`} placeholder="+263 77 661 7821" /></label>
        <label className="text-sm font-bold text-slate-200">Email <span className="text-aurum">required</span><input name="email" className={`${inputClass} mt-2`} placeholder="you@business.com" /></label>
        <label className="text-sm font-bold text-slate-200">Business name <span className="text-aurum">required</span><input name="businessName" className={`${inputClass} mt-2`} placeholder="Your business" /></label>
        <label className="text-sm font-bold text-slate-200">Business type <span className="text-slate-500">optional</span><input name="businessType" className={`${inputClass} mt-2`} placeholder="Salon, restaurant, retail, logistics..." /></label>
        <label className="text-sm font-bold text-slate-200">Service interested in <span className="text-aurum">required</span><select name="serviceInterestedIn" className={`${inputClass} mt-2`}>{services.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-bold text-slate-200">Budget range <span className="text-slate-500">optional</span><select name="budgetRange" className={`${inputClass} mt-2`}>{budgets.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-bold text-slate-200">Urgency <span className="text-slate-500">optional</span><select name="urgency" className={`${inputClass} mt-2`}>{urgency.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-bold text-slate-200 sm:col-span-2">Notes <span className="text-slate-500">optional</span><textarea name="notes" className={`${inputClass} mt-2 min-h-32`} placeholder="Tell us what you need, your location, measurements, deadline, or ideas." /></label>
      </div>
      {message ? <p className="mt-4 rounded-lg border border-red-300/25 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-100">{message}</p> : null}
      <button type="submit" disabled={isPending} className={`${buttonClass} mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60`}>{isPending ? "Submitting..." : "Submit branding request"}</button>
      <p className="mt-4 text-center text-xs font-semibold leading-5 text-slate-400">We use this information only to respond to your enquiry. Do not upload or share confidential documents here.</p>
      <Link href="/intake/shopfront" className="mt-4 block text-center text-sm font-bold text-aurum hover:text-ember">Need a shopfront mockup instead?</Link>
    </form>
  );
}
