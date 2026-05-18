"use client";

import { Copy, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Lead } from "@/lib/mock-data";
import { generateWhatsAppScript, ScriptType, scriptTypes } from "@/lib/scripts";
import { buttonClass, inputClass } from "@/components/ui";

export function WhatsAppScriptGenerator({ lead }: { lead: Lead }) {
  const [type, setType] = useState<ScriptType>("quote-follow-up");
  const [copied, setCopied] = useState(false);
  const script = useMemo(() => generateWhatsAppScript(type, lead), [lead, type]);

  async function copyScript() {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-black text-white">
          <MessageCircle size={18} className="text-aurum" />
          WhatsApp Script Generator
        </div>
        <select className={`${inputClass} sm:max-w-72`} value={type} onChange={(event) => setType(event.target.value as ScriptType)}>
          {scriptTypes.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <p className="mt-4 rounded-lg border border-aurum/20 bg-aurum/10 p-4 text-sm leading-6 text-slate-100">{script}</p>
      <button type="button" className={`${buttonClass} mt-4`} onClick={copyScript}>
        <Copy size={16} />
        {copied ? "Copied" : "Copy Script"}
      </button>
    </div>
  );
}
