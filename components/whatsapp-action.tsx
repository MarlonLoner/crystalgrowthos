"use client";

import { Copy, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { buttonClass } from "@/components/ui";

function formatZimbabwePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("263")) return digits;
  if (digits.startsWith("0")) return `263${digits.slice(1)}`;
  if (digits.startsWith("7") && digits.length === 9) return `263${digits}`;

  return digits;
}

export function createWhatsAppUrl(phone: string, message: string) {
  const formattedPhone = formatZimbabwePhone(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppAction({
  phone,
  message,
  className
}: {
  phone: string;
  message: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = useMemo(() => createWhatsAppUrl(phone, message), [phone, message]);

  async function copyMessage() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      <button type="button" onClick={copyMessage} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15">
        <Copy size={14} />
        {copied ? "Copied" : "Copy Message"}
      </button>
      <a href={url} target="_blank" rel="noreferrer" className={`${buttonClass} px-3 py-2 text-xs`}>
        <MessageCircle size={14} />
        Open WhatsApp
      </a>
    </div>
  );
}

