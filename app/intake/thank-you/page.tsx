import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { buttonClass } from "@/components/ui";

export default function IntakeThankYouPage() {
  const message = "Hi Crystal Branding Studio, I just submitted my branding request.";
  const whatsAppUrl = `https://wa.me/263776617821?text=${encodeURIComponent(message)}`;

  return (
    <main className="grid min-h-screen place-items-center bg-obsidian px-4 py-10 text-white">
      <section className="w-full max-w-2xl rounded-lg border border-white/10 bg-graphite/85 p-6 text-center shadow-glow sm:p-8">
        <div className="mx-auto grid size-14 place-items-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="mt-6 text-3xl font-black">Request received</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-mercury">Thank you. The Crystal Branding Studio team will review your request and respond with the next practical step.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={whatsAppUrl} target="_blank" rel="noreferrer" className={buttonClass}><MessageCircle size={18} /> Open WhatsApp</a>
          <Link href="/intake" className="inline-flex items-center justify-center rounded-lg border border-white/10 px-4 py-2.5 text-sm font-black text-white hover:bg-white/10">Submit another request</Link>
        </div>
      </section>
    </main>
  );
}

