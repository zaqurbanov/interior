/**
 * Where the repo's own frames (public/frames) are served from: "/frames", or
 * their copy in Vercel Blob once scripts/frames-to-blob.mjs has uploaded them
 * and NEXT_PUBLIC_FRAMES_BASE points at it. Frames generated in the admin carry
 * their own base (Story.base) and do not use this.
 */
export const FRAMES_BASE = (process.env.NEXT_PUBLIC_FRAMES_BASE || "/frames").replace(/\/+$/, "");

/** URL of a file under public/frames, e.g. framesUrl("scene1/mobile/0001.webp"). */
export const framesUrl = (path: string) => `${FRAMES_BASE}/${path.replace(/^\/+/, "")}`;
