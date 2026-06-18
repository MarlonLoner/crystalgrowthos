"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyPublicQuoteLink({ quoteNumber, className = "" }: { quoteNumber: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const path = `/q/${encodeURIComponent(quoteNumber)}`;
    const url = typeof window === "undefined" ? path : `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" onClick={copyLink} className={className || "inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-black text-slate-900"}>
      {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy Public Link"}
    </button>
  );
}
