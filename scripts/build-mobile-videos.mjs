// Builds the H.264 videos phones play instead of the frame sequences (they
// autoplay there, so a real video is 4–6x lighter than hundreds of WebP files).
// Needs the frames in public/frames (download them from Blob if this is a fresh
// clone); upload the new MP4s with scripts/frames-to-blob.mjs afterwards.
// Made from the existing mobile frames, so the source MP4s are not needed:
//   public/frames/<slug>/v<version>/mobile.mp4   (project walkthroughs)
//   public/frames/home/v<HOME_VERSION>/mobile.mp4 (home page, scene1 + scene2)
// Usage: node scripts/build-mobile-videos.mjs [slug …]   (FFMPEG=/path/to/ffmpeg)
// Re-run after re-extracting frames; the version folder keeps caches honest.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { encodeMobileVideo } from "./lib/media.mjs";

// Keep in sync with HOME_VIDEO in src/lib/sequence.ts.
const HOME_VERSION = 1;
const HOME_FPS = 24;

const mb = (file) => (statSync(file).size / 1048576).toFixed(2);

/** Frame rate per slug, read from src/lib/project-story.ts (default 24). */
function storyFps() {
  const src = readFileSync("src/lib/project-story.ts", "utf8");
  const out = {};
  const blocks = src.split(/\n\s{2}(?=["\w-]+: \{\n\s+slug:)/);
  for (const b of blocks) {
    const slug = b.match(/slug: "([^"]+)"/)?.[1];
    if (slug) out[slug] = Number(b.match(/\bfps: (\d+)/)?.[1] ?? 24);
  }
  return out;
}

function encode(sceneDirs, fps, out) {
  const n = encodeMobileVideo(sceneDirs, fps, out);
  console.log(`${out}: ${n} frames @ ${fps}fps, ${mb(out)} MB`);
}

const only = process.argv.slice(2);
const want = (slug) => !only.length || only.includes(slug);

if (want("home")) {
  encode(["public/frames/scene1", "public/frames/scene2"], HOME_FPS, `public/frames/home/v${HOME_VERSION}/mobile.mp4`);
}

const fps = storyFps();
for (const slug of Object.keys(fps).filter(want)) {
  const root = path.join("public/frames", slug);
  if (!existsSync(root)) continue;
  // The newest version folder is the one project-story.ts points at.
  const version = readdirSync(root).filter((d) => /^v\d+$/.test(d)).sort((a, b) => +b.slice(1) - +a.slice(1))[0];
  if (!version) continue;
  const base = path.join(root, version);
  const scenes = readdirSync(base).filter((d) => /^scene\d+$/.test(d)).sort((a, b) => +a.slice(5) - +b.slice(5));
  encode(scenes.map((s) => path.join(base, s)), fps[slug], path.join(base, "mobile.mp4"));
}
