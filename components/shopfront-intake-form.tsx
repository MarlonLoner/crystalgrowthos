"use client";

import Link from "next/link";
import { UploadCloud } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
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
const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"]);
const maxSize = 8 * 1024 * 1024;

function UploadField({
  label,
  help,
  assetType,
  onUploaded
}: {
  label: string;
  help: string;
  assetType: UploadedAsset["type"];
  onUploaded: (asset: UploadedAsset) => void;
}) {
  const [status, setStatus] = useState<string>("No file uploaded");
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFile(file: File | undefined) {
    if (!file) return;
    if (!allowedTypes.has(file.type)) {
      setStatus("Use JPG, PNG, WEBP, or SVG only.");
      return;
    }
    if (!file.size) {
      setStatus("This file appears empty. Please choose another image.");
      return;
    }
    if (file.size > maxSize) {
      setStatus("File must be 8MB or smaller.");
      return;
    }

    setIsUploading(true);
    setStatus("Uploading...");

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const result = await response.json();

      if (!response.ok) {
        setStatus(result.error ?? "Upload failed. Please try again or use WhatsApp.");
        return;
      }

      onUploaded({ ...result, type: assetType, notes: label });
      setStatus(`Uploaded ${result.filename}`);
    } catch {
      setStatus("Upload failed. Please try again or send the file by WhatsApp after submitting.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <label className="rounded-lg border border-white/10 bg-obsidian/50 p-3 text-sm font-bold text-slate-200">
      <span className="flex items-center gap-2"><UploadCloud size={16} className="text-aurum" /> {label}</span>
      <span className="mt-1 block text-xs font-medium leading-5 text-mercury">{help}</span>
      <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml" disabled={isUploading} onChange={(event) => uploadFile(event.target.files?.[0])} className="mt-2 block w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-aurum file:px-3 file:py-2 file:text-xs file:font-black file:text-obsidian" />
      <span className="mt-2 block text-xs text-mercury">{status}</span>
    </label>
  );
}

export function ShopfrontIntakeForm() {
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const assetsJson = useMemo(() => JSON.stringify(assets), [assets]);

  function upsertAsset(asset: UploadedAsset) {
    setAssets((current) => [...current.filter((item) => item.type !== asset.type), asset]);
  }

  function submit(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      const result = await createShopfrontIntakeLeadAction(formData);
      if (result && !result.ok) setMessage(result.message);
    });
  }

  return (
    <form action={submit} className="rounded-lg border border-white/10 bg-graphite/85 p-5 shadow-glow backdrop-blur sm:p-6">
      <input type="hidden" name="source" value="Shopfront mockup form" />
      <input type="hidden" name="serviceInterestedIn" value="Shopfront branding mockup" />
      <input type="hidden" name="assetsJson" value={assetsJson} />
      <input type="text" name="companyWebsite" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="mb-5 rounded-lg border border-aurum/20 bg-aurum/10 p-4 text-sm leading-6 text-slate-200">
        Upload a clear shopfront photo and logo if available. Accepted files: JPG, PNG, WEBP, SVG, up to 8MB each. Do not upload confidential documents.
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-200">Name <span className="text-aurum">required</span><input name="name" className={`${inputClass} mt-2`} /></label>
        <label className="text-sm font-bold text-slate-200">Phone <span className="text-aurum">required</span><input name="phone" className={`${inputClass} mt-2`} placeholder="+263 77 661 7821" /></label>
        <label className="text-sm font-bold text-slate-200">Email <span className="text-aurum">required</span><input name="email" className={`${inputClass} mt-2`} placeholder="you@business.com" /></label>
        <label className="text-sm font-bold text-slate-200">Business name <span className="text-aurum">required</span><input name="businessName" className={`${inputClass} mt-2`} /></label>
        <label className="text-sm font-bold text-slate-200">Business type <span className="text-slate-500">optional</span><input name="businessType" className={`${inputClass} mt-2`} placeholder="Retail, restaurant, salon..." /></label>
        <label className="text-sm font-bold text-slate-200">Preferred style <span className="text-slate-500">optional</span><select name="preferredStyle" className={`${inputClass} mt-2`}>{styles.map((item) => <option key={item}>{item}</option>)}</select></label>
        <UploadField label="Shopfront image" help="A clear front-facing photo helps us place signage accurately." assetType="SHOPFRONT_IMAGE" onUploaded={upsertAsset} />
        <UploadField label="Logo" help="PNG, SVG, or a clear logo image is best for mockups." assetType="LOGO" onUploaded={upsertAsset} />
        <UploadField label="Reference image" help="Optional inspiration, colors, or style references." assetType="REFERENCE_IMAGE" onUploaded={upsertAsset} />
        <label className="text-sm font-bold text-slate-200">Shopfront image URL fallback <span className="text-slate-500">optional</span><input name="shopfrontImageUrl" className={`${inputClass} mt-2`} placeholder="https://..." /></label>
        <label className="text-sm font-bold text-slate-200">Logo URL fallback <span className="text-slate-500">optional</span><input name="logoUrl" className={`${inputClass} mt-2`} placeholder="https://..." /></label>
        <label className="text-sm font-bold text-slate-200">Reference image URL fallback <span className="text-slate-500">optional</span><input name="referenceImageUrl" className={`${inputClass} mt-2`} placeholder="https://..." /></label>
        <label className="text-sm font-bold text-slate-200">Deadline <span className="text-slate-500">optional</span><input name="deadline" className={`${inputClass} mt-2`} placeholder="e.g. end of June" /></label>
        <label className="text-sm font-bold text-slate-200">Budget range <span className="text-slate-500">optional</span><select name="budgetRange" className={`${inputClass} mt-2`}>{budgets.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-bold text-slate-200">Urgency <span className="text-slate-500">optional</span><select name="urgency" className={`${inputClass} mt-2`}>{urgency.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-bold text-slate-200 sm:col-span-2">Notes <span className="text-slate-500">optional</span><textarea name="notes" className={`${inputClass} mt-2 min-h-32`} placeholder="Tell us your location, target look, or what is wrong with the current shopfront." /></label>
      </div>
      {message ? <p className="mt-4 rounded-lg border border-red-300/25 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-100">{message}</p> : null}
      <button type="submit" disabled={isPending || assets.some((asset) => !asset.url)} className={`${buttonClass} mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60`}>{isPending ? "Submitting..." : "Request free mockup"}</button>
      <p className="mt-4 text-center text-xs font-semibold leading-5 text-slate-400">Uploaded assets are used to prepare your requested branding/mockup work. If upload fails, submit the form and send assets by WhatsApp from the confirmation page.</p>
      <Link href="/intake" className="mt-4 block text-center text-sm font-bold text-aurum hover:text-ember">Submit a general branding request</Link>
    </form>
  );
}
