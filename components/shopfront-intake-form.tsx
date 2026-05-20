"use client";

import Link from "next/link";
import { UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { createShopfrontIntakeLeadAction } from "@/lib/actions";
import { buttonClass, inputClass } from "@/components/ui";

type UploadedAsset = {
  type: "SHOPFRONT_IMAGE" | "LOGO" | "REFERENCE_IMAGE";
  url: string;
  pathname: string;
  filename: string;
  contentType: string;
  size: number;
  notes?: string;
};

const styles = ["Premium and bold", "Clean and modern", "Bright and attention-grabbing", "Luxury retail", "Simple budget-friendly", "Not sure yet"];
const budgets = ["Under $300", "$300 - $500", "$500 - $1,000", "$1,000 - $2,000", "$2,000+", "Not sure yet"];
const urgency = ["Urgent - today", "This week", "This month", "Planning ahead", "Not sure yet"];

function UploadField({
  label,
  assetType,
  onUploaded
}: {
  label: string;
  assetType: UploadedAsset["type"];
  onUploaded: (asset: UploadedAsset) => void;
}) {
  const [status, setStatus] = useState<string>("No file uploaded");
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFile(file: File | undefined) {
    if (!file) return;
    setIsUploading(true);
    setStatus("Uploading...");

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const result = await response.json();

      if (!response.ok) {
        setStatus(result.error ?? "Upload failed");
        return;
      }

      onUploaded({ ...result, type: assetType, notes: label });
      setStatus(`Uploaded ${result.filename}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <label className="rounded-lg border border-white/10 bg-obsidian/50 p-3 text-sm font-bold text-slate-200">
      <span className="flex items-center gap-2"><UploadCloud size={16} className="text-aurum" /> {label}</span>
      <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml" disabled={isUploading} onChange={(event) => uploadFile(event.target.files?.[0])} className="mt-2 block w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-aurum file:px-3 file:py-2 file:text-xs file:font-black file:text-obsidian" />
      <span className="mt-2 block text-xs text-mercury">{status}</span>
    </label>
  );
}

export function ShopfrontIntakeForm() {
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const assetsJson = useMemo(() => JSON.stringify(assets), [assets]);

  function upsertAsset(asset: UploadedAsset) {
    setAssets((current) => [...current.filter((item) => item.type !== asset.type), asset]);
  }

  return (
    <form action={createShopfrontIntakeLeadAction} className="rounded-lg border border-white/10 bg-graphite/85 p-5 shadow-glow backdrop-blur sm:p-6">
      <input type="hidden" name="source" value="Shopfront mockup form" />
      <input type="hidden" name="serviceInterestedIn" value="Shopfront branding mockup" />
      <input type="hidden" name="assetsJson" value={assetsJson} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-200">Name<input name="name" required className={`${inputClass} mt-2`} /></label>
        <label className="text-sm font-bold text-slate-200">Phone<input name="phone" required className={`${inputClass} mt-2`} placeholder="+263 77 661 7821" /></label>
        <label className="text-sm font-bold text-slate-200">Email<input name="email" required type="email" className={`${inputClass} mt-2`} /></label>
        <label className="text-sm font-bold text-slate-200">Business name<input name="businessName" required className={`${inputClass} mt-2`} /></label>
        <label className="text-sm font-bold text-slate-200">Business type<input name="businessType" className={`${inputClass} mt-2`} placeholder="Retail, restaurant, salon..." /></label>
        <label className="text-sm font-bold text-slate-200">Preferred style<select name="preferredStyle" className={`${inputClass} mt-2`}>{styles.map((item) => <option key={item}>{item}</option>)}</select></label>
        <UploadField label="Shopfront image" assetType="SHOPFRONT_IMAGE" onUploaded={upsertAsset} />
        <UploadField label="Logo" assetType="LOGO" onUploaded={upsertAsset} />
        <UploadField label="Reference image" assetType="REFERENCE_IMAGE" onUploaded={upsertAsset} />
        <label className="text-sm font-bold text-slate-200">Shopfront image URL fallback<input name="shopfrontImageUrl" className={`${inputClass} mt-2`} placeholder="https://..." /></label>
        <label className="text-sm font-bold text-slate-200">Logo URL fallback<input name="logoUrl" className={`${inputClass} mt-2`} placeholder="https://..." /></label>
        <label className="text-sm font-bold text-slate-200">Reference image URL fallback<input name="referenceImageUrl" className={`${inputClass} mt-2`} placeholder="https://..." /></label>
        <label className="text-sm font-bold text-slate-200">Deadline<input name="deadline" type="date" className={`${inputClass} mt-2`} /></label>
        <label className="text-sm font-bold text-slate-200">Budget range<select name="budgetRange" className={`${inputClass} mt-2`}>{budgets.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-bold text-slate-200">Urgency<select name="urgency" className={`${inputClass} mt-2`}>{urgency.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-bold text-slate-200 sm:col-span-2">Notes<textarea name="notes" className={`${inputClass} mt-2 min-h-32`} placeholder="Tell us your location, target look, or what is wrong with the current shopfront." /></label>
      </div>
      <button type="submit" className={`${buttonClass} mt-5 w-full`}>Request free mockup</button>
      <Link href="/intake" className="mt-4 block text-center text-sm font-bold text-aurum hover:text-ember">Submit a general branding request</Link>
    </form>
  );
}
