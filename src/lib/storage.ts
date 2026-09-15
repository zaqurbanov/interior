import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Local-disk storage for uploaded images. Swap this module for Cloudinary/S3
// when deploying to a serverless host with a read-only filesystem.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function saveUpload(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new Error("Only JPG, PNG, WebP or AVIF images are allowed.");
  if (file.size > MAX_BYTES) throw new Error("Images must be smaller than 8 MB.");
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
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
  if (!url.startsWith("/uploads/")) return;
  const file = path.join(UPLOAD_DIR, path.basename(url));
  await unlink(file).catch(() => {});
}
