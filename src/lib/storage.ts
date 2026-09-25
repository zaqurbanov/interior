import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { del } from "@vercel/blob";
import { IMAGE_TYPES, MAX_UPLOAD_BYTES, isStoredUrl, type UploadDriver } from "./upload-config";

export { isAllowedImageUrl, isStoredUrl } from "./upload-config";

// Where admin uploads live. With BLOB_READ_WRITE_TOKEN set (Vercel adds it once
// a Blob store is connected) the browser uploads straight to Vercel Blob with a
// short-lived token from /api/admin/upload. Without it the upload route writes
// to public/uploads, which works in local development and on a self-hosted
// server, but not on Vercel, whose filesystem is read-only.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const EXT: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif" };

export const uploadDriver = (): UploadDriver => (process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local");

export function checkImage(type: string, size: number) {
  if (!(IMAGE_TYPES as readonly string[]).includes(type)) throw new Error("Only JPG, PNG, WebP or AVIF images are allowed.");
  if (size > MAX_UPLOAD_BYTES) throw new Error(`Images must be smaller than ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`);
}

/** Local driver: write an uploaded file to public/uploads and return its URL. */
export async function saveLocalUpload(file: File): Promise<string> {
  if (process.env.VERCEL) {
    throw new Error("Uploads need a Vercel Blob store: connect one so BLOB_READ_WRITE_TOKEN is set.");
  }
  checkImage(file.type, file.size);
  const base = path.parse(file.name).name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "image";
  const name = `${base}-${randomUUID().slice(0, 8)}${EXT[file.type]}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function deleteUpload(url: string) {
  if (!isStoredUrl(url)) return;
  if (url.startsWith("https://")) {
    if (uploadDriver() === "blob") await del(url).catch(() => {});
    return;
  }
  await unlink(path.join(UPLOAD_DIR, path.basename(url))).catch(() => {});
}
