import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"]);
const maxSize = 8 * 1024 * 1024;

function safeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WEBP, and SVG images are allowed" }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ error: "File must be 8MB or smaller" }, { status: 400 });
    }

    const filename = safeFilename(file.name || "asset");
    const pathname = `crystal-growth-os/leads/${Date.now()}-${filename}`;
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      filename,
      contentType: file.type,
      size: file.size
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Upload failed"
    }, { status: 500 });
  }
}
