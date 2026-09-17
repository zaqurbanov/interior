// Extracts the per-project walkthrough videos (videos/*.mp4) into WebP sequences
// used by the project scroll story. Usage: node scripts/extract-project-frames.mjs
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";

const stories = [
  {
    slug: "villa-la-belle",
    // 1.mp4 = arrival & garage, 2.mp4 = interior (3.mp4 is the pool, unused).
    // Every 2nd frame keeps the sequence light.
    scenes: ["videos/1.mp4", "videos/2.mp4"],
    // Bump when the frames change: cached frame URLs are immutable for a year.
    version: 2,
    step: 2,
  },
];
const sizes = [
  { name: "desktop", width: 1440, quality: 50 },
  { name: "mobile", width: 860, quality: 68 },
];

const ff = (...args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

for (const story of stories) {
  // Check the sources first: never delete existing frames for a missing video.
  const missing = story.scenes.filter((src) => !existsSync(src));
  if (missing.length) {
    console.error(`Skipping ${story.slug}: missing source video(s) ${missing.join(", ")}`);
    continue;
  }
  rmSync(`public/frames/${story.slug}`, { recursive: true, force: true });
  const base = `public/frames/${story.slug}/v${story.version}`;
  const step = story.step ?? 1;
  story.scenes.forEach((src, i) => {
    for (const { name, width, quality } of sizes) {
      const out = `${base}/scene${i + 1}/${name}`;
      mkdirSync(out, { recursive: true });
      const select = step > 1 ? `select='not(mod(n\\,${step}))',` : "";
      ff("-i", src, "-vf", `${select}scale=${width}:-2`, "-fps_mode", "passthrough","-c:v", "libwebp", "-quality", String(quality), `${out}/%04d.webp`);
      console.log(`${out}: ${readdirSync(out).length} frames`);
    }
  });
  // Poster: first frame of the first scene.
  ff("-i", story.scenes[0], "-frames:v", "1", "-c:v", "libwebp", "-quality", "82", `${base}/poster.webp`);
}
console.log("Done.");
