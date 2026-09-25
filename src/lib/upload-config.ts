// Upload rules shared by the browser (checks before uploading) and the server
// (the upload route enforces them again).

export const UPLOAD_ENDPOINT = "/api/admin/upload";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const IMAGE_ACCEPT = IMAGE_TYPES.join(",");

/** Walkthrough source videos (frames are extracted from them, see lib/frame-jobs.ts). */
export const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"] as const;
export const VIDEO_ACCEPT = VIDEO_TYPES.join(",");
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

/** Largest single file the server accepts. Files go straight to storage, not
 *  through a server action, so this is not bound by Vercel's 4.5 MB body limit. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/** Longest edge images are scaled down to in the browser before uploading. */
export const MAX_IMAGE_EDGE = 2560;

export type UploadDriver = "blob" | "local";

const isBlobUrl = (url: string) => /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(url);
const isLocalUpload = (url: string) => /^\/uploads\/[\w.-]+$/.test(url);

export const isVideoUrl = (url: string) => isStoredUrl(url) && /\.(mp4|mov|webm)$/i.test(url);

/** A file the admin uploaded (Blob or public/uploads), i.e. one it may delete. */
export const isStoredUrl = (url: string) => isBlobUrl(url) || isLocalUpload(url);

/** Image URLs a form may save: uploads, or files shipped with the site
 *  (/images/…). Other hosts and protocol-relative URLs are refused. */
export const isAllowedImageUrl = (url: string) =>
  isStoredUrl(url) || (/^\/[\w-][\w\-./]*$/.test(url) && !url.includes(".."));

export const formatBytes = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
