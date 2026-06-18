"use client";

import { useState } from "react";
import { crystalBrand } from "@/lib/crystal-brand";

export function CrystalLogo({ className = "" }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`mx-auto flex min-h-28 max-w-[420px] items-center justify-center rounded-full border-4 border-[#174c9f] px-8 py-6 text-center ${className}`}>
        <div>
          <p className="text-3xl font-black uppercase tracking-[0.12em] text-[#174c9f]">Crystal</p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.22em] text-[#c51f27]">Branding Studio</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={crystalBrand.logoPath}
      alt="Crystal Branding Studio logo"
      className={`mx-auto h-auto w-full max-w-[420px] object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
