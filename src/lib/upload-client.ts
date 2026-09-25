// Browser side of admin uploads: shrink the image, send it to storage, register
// it in the media library. Import only from client components.
import { upload } from "@vercel/blob/client";
import { registerMedia } from "@/app/actions/media";
import { IMAGE_TYPES, MAX_IMAGE_EDGE, MAX_UPLOAD_BYTES, UPLOAD_ENDPOINT, formatBytes, type UploadDriver } from "./upload-config";

export type PrepareOptions = {
  /** Longest edge after resizing. */
  maxEdge?: number;
  /** Output format. Social-sharing images use JPEG, which every network reads. */
  format?: "webp" | "jpeg";
  quality?: number;
};

export type Uploaded = { url: string; width: number; height: number; size: number };

// Files already this small and in the target format are sent untouched.
const KEEP_BELOW = 1.5 * 1024 * 1024;

/** Scale an image down to maxEdge and re-encode it, unless that would not help. */
export async function prepareImage(file: File, opts: PrepareOptions = {}): Promise<{ file: File; width: number; height: number }> {
  const { maxEdge = MAX_IMAGE_EDGE, format = "webp", quality = 0.86 } = opts;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { file, width: 0, height: 0 }; // the browser cannot decode it; let the server decide
  }
  const { width, height } = bitmap;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const target = format === "jpeg" ? "image/jpeg" : "image/webp";
  if (scale === 1 && file.size <= KEEP_BELOW && file.type === target) {
    bitmap.close();
    return { file, width, height };
  }

  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  if (target === "image/jpeg") {
    ctx.fillStyle = "#fff"; // JPEG has no transparency
    ctx.fillRect(0, 0, w, h);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const encode = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, quality));
  let blob = await encode(target);
  // Browsers without a WebP encoder hand back PNG; JPEG is the safe fallback.
  if (blob && blob.type !== target) blob = await encode("image/jpeg");
  if (!blob || (scale === 1 && blob.size >= file.size)) return { file, width, height };

  const ext = blob.type === "image/webp" ? ".webp" : ".jpg";
  const name = file.name.replace(/\.[^.]+$/, "") + ext;
  return { file: new File([blob], name, { type: blob.type }), width: w, height: h };
}

let driverPromise: Promise<UploadDriver> | null = null;
function getDriver() {
  driverPromise ??= fetch(UPLOAD_ENDPOINT, { cache: "no-store" })
    .then(async (r) => {
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.error || "Upload service unavailable.");
      return json.driver as UploadDriver;
    })
    .catch((err) => {
      driverPromise = null;
      throw err;
    });
  return driverPromise;
}

const safeName = (name: string) => {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return `${base || "image"}${dot > 0 ? name.slice(dot).toLowerCase() : ""}`;
};

function postLocal(file: File, onProgress?: (pct: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", UPLOAD_ENDPOINT);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.((e.loaded / e.total) * 100);
    xhr.onload = () => {
      let json: { url?: string; error?: string } = {};
      try {
        json = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && json.url) resolve(json.url);
      else reject(new Error(json.error || `Upload failed (${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
}

/** Resize, upload and register one image. Progress is reported as 0–100. */
export async function uploadImage(original: File, opts: PrepareOptions & { onProgress?: (pct: number) => void } = {}): Promise<Uploaded> {
  if (!(IMAGE_TYPES as readonly string[]).includes(original.type)) {
    throw new Error(`${original.name}: only JPG, PNG, WebP or AVIF images are allowed.`);
  }
  const { file, width, height } = await prepareImage(original, opts);
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${original.name} is ${formatBytes(file.size)} — the limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`);
  }

  const driver = await getDriver();
  const url =
    driver === "blob"
      ? (
          await upload(`uploads/${safeName(file.name)}`, file, {
            access: "public",
            handleUploadUrl: UPLOAD_ENDPOINT,
            contentType: file.type,
            multipart: file.size > 8 * 1024 * 1024,
            onUploadProgress: (p) => opts.onProgress?.(p.percentage),
          })
        ).url
      : await postLocal(file, opts.onProgress);

  // The file is already stored and usable; a failed library entry only loses
  // its size and dimensions (the library still lists it once a page uses it).
  await registerMedia({ url, name: original.name, contentType: file.type, size: file.size, width, height }).then(
    (res) => !res.ok && console.warn("[upload] media library:", res.message),
    (err) => console.warn("[upload] media library:", err),
  );
  return { url, width, height, size: file.size };
}
