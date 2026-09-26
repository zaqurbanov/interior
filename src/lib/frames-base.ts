/**
 * Where the built-in frames (home page, code walkthroughs, posters, phone MP4s)
 * are served from. They live in Vercel Blob (uploaded by scripts/frames-to-blob.mjs)
 * and are no longer in the repo; public/frames is only a local working folder
 * for the extract scripts. NEXT_PUBLIC_FRAMES_BASE overrides it — "/frames" to
 * preview freshly extracted frames locally before uploading them. Frames made
 * in the admin carry their own base (Story.base) and do not use this.
 */
const BLOB_FRAMES = "https://cvygwhsvxo22d1ct.public.blob.vercel-storage.com/frames";
export const FRAMES_BASE = (process.env.NEXT_PUBLIC_FRAMES_BASE || BLOB_FRAMES).replace(/\/+$/, "");

/** URL of a file under public/frames, e.g. framesUrl("scene1/mobile/0001.webp"). */
export const framesUrl = (path: string) => `${FRAMES_BASE}/${path.replace(/^\/+/, "")}`;
