import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";

// Admin uploads. With BLOB_READ_WRITE_TOKEN set (Vercel adds it once a Blob
// store is connected) files go to Vercel Blob; without it they are written to
// public/uploads, which only works in local development — Vercel's filesystem
// is read-only.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);
// Vercel functions reject request bodies over 4.5 MB, and a server action
// carries the whole form, so keep single files comfortably below that.
const MAX_BYTES = 4 * 1024 * 1024;

const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const isBlobUrl = (url: string) => /^https:\/\/[^/]+\.blob\.vercel-storage\.com\//.test(url);

export async function saveUpload(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new Error("Only JPG, PNG, WebP or AVIF images are allowed.");
  if (file.size > MAX_BYTES) throw new Error("Images must be smaller than 4 MB.");
  const name = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;

  if (useBlob()) {
    const blob = await put(`uploads/${name}`, file, { access: "public", contentType: file.type });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error("Uploads need a Vercel Blob store: connect one so BLOB_READ_WRITE_TOKEN is set.");
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function saveUploads(files: File[]): Promise<string[]> {
  const out: string[] = [];
  for (const f of files) {
    const url = await saveUpload(f);
    if (url) out.push(url);
  }
  return out;
}

export async function deleteUpload(url: string) {
  if (isBlobUrl(url)) {
    if (useBlob()) await del(url).catch(() => {});
    return;
  }
  if (!url.startsWith("/uploads/")) return;
  await unlink(path.join(UPLOAD_DIR, path.basename(url))).catch(() => {});
}
