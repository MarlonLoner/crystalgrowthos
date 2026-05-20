import Link from "next/link";
import { ImagePlus, Sparkles } from "lucide-react";
import { ShopfrontIntakeForm } from "@/components/shopfront-intake-form";

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
          <p className="mt-5 max-w-xl text-base leading-7 text-mercury">Upload your current shopfront, logo, and any reference image. We will review the assets and respond with the next step.</p>
          <div className="mt-8 rounded-lg border border-aurum/25 bg-aurum/10 p-4 text-sm leading-6 text-slate-200">
            <ImagePlus className="mb-3 text-aurum" size={22} />
            Uploads are stored securely with Vercel Blob. URL fallback fields are available for testing or shared Drive/WhatsApp links.
          </div>
        </section>

        <ShopfrontIntakeForm />
      </div>
    </main>
  );
}
