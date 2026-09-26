/**
 * Where the built-in frames (home page, code walkthroughs, posters, phone MP4s)
 * are served from: public/frames, as Vercel static files.
 *
 * They were moved to Vercel Blob once, but the Hobby plan allows 2,000 "advanced
 * operations" (uploads) a month and the 6,294 frames went far past it, which
 * blocks the store — so they are back in the repo. NEXT_PUBLIC_FRAMES_URL can
 * point them at a CDN or a paid Blob store later. (The older
 * NEXT_PUBLIC_FRAMES_BASE is deliberately no longer read, so a leftover value
 * in Vercel cannot send the site to the blocked store.) Frames made in the
 * admin carry their own base (Story.base) and do not use this.
 */
export const FRAMES_BASE = (process.env.NEXT_PUBLIC_FRAMES_URL || "/frames").replace(/\/+$/, "");

/** URL of a file under public/frames, e.g. framesUrl("scene1/mobile/0001.webp"). */
export const framesUrl = (path: string) => `${FRAMES_BASE}/${path.replace(/^\/+/, "")}`;
