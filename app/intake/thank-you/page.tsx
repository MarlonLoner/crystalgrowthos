import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { buttonClass } from "@/components/ui";

function contextCopy(type?: string | string[]) {
  const value = Array.isArray(type) ? type[0] : type;
  if (value === "shopfront") {
    return {
      title: "Mockup request received",
      body: "Thank you. The Crystal team will review your shopfront/logo assets and respond with the next practical step.",
      prepare: "Please keep your logo, shopfront measurements, preferred colors, and deadline ready."
    };
  }
  return {
    title: "Request received",
    body: "Thank you. The Crystal Branding Studio team will review your request and respond with the next practical step.",
    prepare: "Please prepare your logo, photos, rough sizes, location, budget range, and deadline if you have them."
  };
}

export default async function IntakeThankYouPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = searchParams ? await searchParams : {};
  const copy = contextCopy(params.type);
  const message = params.type === "shopfront"
    ? "Hi Crystal Branding Studio, I just submitted my shopfront mockup request."
    : "Hi Crystal Branding Studio, I just submitted my branding request.";
  const whatsAppUrl = `https://wa.me/263776617821?text=${encodeURIComponent(message)}`;

  return (
    <main className="grid min-h-screen place-items-center bg-obsidian px-4 py-10 text-white">
      <section className="w-full max-w-2xl rounded-lg border border-white/10 bg-graphite/85 p-6 text-center shadow-glow sm:p-8">
        <div className="mx-auto grid size-14 place-items-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="mt-6 text-3xl font-black">{copy.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-mercury">{copy.body}</p>
        <div className="mx-auto mt-5 max-w-xl rounded-lg border border-white/10 bg-white/[0.04] p-4 text-left text-sm leading-6 text-slate-300">
          <p className="font-black text-white">What happens next</p>
          <p className="mt-2">We will check your request, confirm anything missing, and guide you toward a mockup, quote, or production-ready next step.</p>
          <p className="mt-2">{copy.prepare}</p>
        </div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={whatsAppUrl} target="_blank" rel="noreferrer" className={buttonClass}><MessageCircle size={18} /> Open WhatsApp</a>
          <a href="https://crystalbrandingstudio.com" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-lg border border-white/10 px-4 py-2.5 text-sm font-black text-white hover:bg-white/10">Crystal Branding Studio</a>
          <Link href="/intake" className="inline-flex items-center justify-center rounded-lg border border-white/10 px-4 py-2.5 text-sm font-black text-white hover:bg-white/10">Submit another request</Link>
        </div>
      </section>
    </main>
  );
}
