"use client";

import { Printer } from "lucide-react";

export function PrintQuoteButton({ label = "Download / Save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white print:hidden"
    >
      <Printer size={16} /> {label}
    </button>
  );
}