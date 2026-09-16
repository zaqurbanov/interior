// Extracts the per-project walkthrough videos (videos/*.mp4) into WebP sequences
// used by the project scroll story. Usage: node scripts/extract-project-frames.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";

const stories = [
  {
    slug: "villa-la-belle",
    scenes: ["videos/videolabella1.mp4", "videos/videolabella2.mp4", "videos/videolabella3.mp4"],
  },
];
const sizes = [
  { name: "desktop", width: 1440, quality: 50 },
  { name: "mobile", width: 860, quality: 68 },
];

const ff = (...args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

for (const story of stories) {
  story.scenes.forEach((src, i) => {
    for (const { name, width, quality } of sizes) {
      const out = `public/frames/${story.slug}/scene${i + 1}/${name}`;
      rmSync(out, { recursive: true, force: true });
      mkdirSync(out, { recursive: true });
      ff("-i", src, "-vf", `scale=${width}:-2`, "-c:v", "libwebp", "-quality", String(quality), `${out}/%04d.webp`);
      console.log(`${out}: ${readdirSync(out).length} frames`);
    }
  });
  // Poster: first frame of the first scene.
  ff("-i", story.scenes[0], "-frames:v", "1", "-c:v", "libwebp", "-quality", "82", `public/frames/${story.slug}/poster.webp`);
}
console.log("Done.");
