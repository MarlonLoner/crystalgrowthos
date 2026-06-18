import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"]);
const maxSize = 8 * 1024 * 1024;

function safeFilename(filename: string) {
  const cleaned = filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 120);
  return cleaned && /\.[a-zA-Z0-9]+$/.test(cleaned) ? cleaned : `${cleaned || "asset"}.bin`;
}

export async function POST(request: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "Upload storage is not configured. Please submit the form and send files by WhatsApp." }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (!file.size) {
      return NextResponse.json({ error: "The selected file appears empty." }, { status: 400 });
    }

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WEBP, and SVG images are allowed." }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ error: "File must be 8MB or smaller." }, { status: 400 });
    }

    const filename = safeFilename(file.name || "asset");
    const pathname = `crystal-growth-os/leads/${Date.now()}-${crypto.randomUUID()}-${filename}`;
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      filename,
      contentType: file.type,
      size: file.size
    });
  } catch (error) {
    console.error("[upload] public upload failed", error);
    return NextResponse.json({
      error: "Upload failed. Please try again or send the file by WhatsApp after submitting."
    }, { status: 500 });
  }
}
