// Extracts the scene videos into WebP image sequences used by the scroll animation.
// Requires ffmpeg on PATH. Usage: npm run frames
// Output goes to public/frames (not in git): upload it afterwards with
//   node --env-file=.env.local scripts/frames-to-blob.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";

const scenes = [
  { src: "video.mp4", dir: "scene1" },
  { src: "video2.mp4", dir: "scene2" },
];
const sizes = [
  { name: "desktop", width: 1920, quality: 60 },
  { name: "mobile", width: 960, quality: 72 },
];

const ff = (...args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

// Remove the pre-scene layout from the first version.
rmSync("public/frames/desktop", { recursive: true, force: true });
rmSync("public/frames/mobile", { recursive: true, force: true });

for (const { src, dir } of scenes) {
  for (const { name, width, quality } of sizes) {
    const out = `public/frames/${dir}/${name}`;
    rmSync(out, { recursive: true, force: true });
    mkdirSync(out, { recursive: true });
    ff("-i", src, "-vf", `scale=${width}:-2`, "-c:v", "libwebp", "-quality", String(quality), `${out}/%04d.webp`);
    console.log(`${out}: ${readdirSync(out).length} frames`);
  }
}

// Stills for fallbacks, the before/after section and the OG image.
const still = (src, out, fromEnd) =>
  ff(...(fromEnd ? ["-sseof", "-0.1"] : []), "-i", src, "-frames:v", "1", "-c:v", "libwebp", "-quality", "82", out);
still("video.mp4", "public/frames/poster.webp", false);
still("video.mp4", "public/frames/final.webp", true);
still("video2.mp4", "public/frames/detail.webp", true);
ff("-sseof", "-0.1", "-i", "video.mp4", "-vf", "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630", "-frames:v", "1", "-q:v", "3", "public/og-image.jpg");
console.log("Stills written.");
