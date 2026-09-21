// Extracts the per-project walkthrough videos (videos/*.mp4) into WebP sequences
// used by the project scroll story. Usage: node scripts/extract-project-frames.mjs
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";

const stories = [
  {
    slug: "villa-la-belle",
    // 1.mp4 = arrival & garage, 2.mp4 = interior (3.mp4 is the pool, unused).
    // 15fps: dense enough to scrub without stepping, ~300 frames total.
    scenes: ["videos/1.mp4", "videos/2.mp4"],
    // Bump when the frames change: cached frame URLs are immutable for a year.
    version: 4,
    fps: 15,
  },
  {
    slug: "albert-mews",
    // Pool and garden of the house: the clip's first 2s and last 2s are dropped.
    scenes: [{ src: "videos/Albert2.mp4", start: 2, duration: 6 }],
    version: 3,
  },
  {
    slug: "cannes",
    // Aerial view of the villa dropping down to the pool terrace. The last 3.5s
    // linger on the same pool shot, so they are dropped.
    // 15fps: dense foliage compresses badly, so keep the frame count modest.
    scenes: [{ src: "videos/cannVilla.mp4", duration: 6.5 }],
    version: 2,
    fps: 15,
  },
];
const sizes = [
  { name: "desktop", width: 1440, quality: 50 },
  { name: "mobile", width: 860, quality: 68 },
];

const ff = (...args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

// A scene is "path.mp4" or { src, start, duration } to use only part of the clip.
const sceneSrc = (scene) => (typeof scene === "string" ? scene : scene.src);
const sceneTrim = (scene) => {
  if (typeof scene === "string") return [];
  // Placed after -i so the cut is frame-accurate.
  return [...(scene.start ? ["-ss", String(scene.start)] : []), ...(scene.duration ? ["-t", String(scene.duration)] : [])];
};

for (const story of stories) {
  // Check the sources first: never delete existing frames for a missing video.
  const missing = story.scenes.map(sceneSrc).filter((src) => !existsSync(src));
  if (missing.length) {
    console.error(`Skipping ${story.slug}: missing source video(s) ${missing.join(", ")}`);
    continue;
  }
  rmSync(`public/frames/${story.slug}`, { recursive: true, force: true });
  const base = `public/frames/${story.slug}/v${story.version}`;
  const step = story.step ?? 1;
  const fps = story.fps;
  story.scenes.forEach((scene, i) => {
    const src = sceneSrc(scene);
    for (const { name, width, quality } of sizes) {
      const out = `${base}/scene${i + 1}/${name}`;
      mkdirSync(out, { recursive: true });
      const select = fps ? `fps=${fps},` : step > 1 ? `select='not(mod(n\\,${step}))',` : "";
      ff("-i", src, ...sceneTrim(scene), "-vf", `${select}scale=${width}:-2`, "-fps_mode", "passthrough", "-c:v", "libwebp", "-quality", String(quality), `${out}/%04d.webp`);
      console.log(`${out}: ${readdirSync(out).length} frames`);
    }
  });
  // Poster: first frame of the first scene.
  ff("-i", sceneSrc(story.scenes[0]), ...sceneTrim(story.scenes[0]), "-frames:v", "1", "-c:v", "libwebp", "-quality", "82", `${base}/poster.webp`);
}
console.log("Done.");
