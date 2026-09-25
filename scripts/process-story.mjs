// Turns the source videos of an admin-edited walkthrough into frames:
// desktop + mobile WebP sequences per scene, a poster, and the phone MP4.
// Run by the frame job (src/lib/frame-jobs.ts) — on GitHub Actions
// (.github/workflows/story-frames.yml) or, on a server with ffmpeg, locally.
//
//   STORY_JOB       JSON { storyId, slug, version, fps, sources: [{ url, start, duration }] }
//   STORY_CALLBACK  URL of /api/story-job on the site, told the result
//   STORY_WEBHOOK_SECRET  signs that call (HMAC-SHA256 of the body)
//   BLOB_READ_WRITE_TOKEN  set → frames go to Vercel Blob; unset → public/frames
//   FFMPEG          ffmpeg binary (default "ffmpeg")
import { createHmac } from "node:crypto";
import { copyFileSync, createWriteStream, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { FRAME_SIZES, encodeMobileVideo, ff } from "./lib/media.mjs";

const job = JSON.parse(process.env.STORY_JOB || "null");
const callback = process.env.STORY_CALLBACK || "";
const secret = process.env.STORY_WEBHOOK_SECRET || "";
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

if (!job?.slug || !job.version || !job.sources?.length) {
  console.error("STORY_JOB is missing or incomplete.");
  process.exit(1);
}
if (process.env.GITHUB_ACTIONS && !useBlob) {
  // Frames written on a CI runner would vanish with it.
  console.error("BLOB_READ_WRITE_TOKEN secret is missing.");
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(job.slug)) {
  console.error("Invalid slug.");
  process.exit(1);
}

async function report(result) {
  const body = JSON.stringify({ storyId: job.storyId, version: job.version, ...result });
  console.log("result:", body);
  if (!callback) return;
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  const res = await fetch(callback, { method: "POST", headers: { "Content-Type": "application/json", "X-Signature": signature }, body });
  if (!res.ok) throw new Error(`Callback failed: ${res.status} ${await res.text()}`);
}

/** Local path of a source: downloaded if it is a URL, read from public/ if it is a site path. */
async function fetchSource(url, dir, i) {
  const file = path.join(dir, `source${i + 1}${path.extname(new URL(url, "http://x").pathname) || ".mp4"}`);
  if (/^https?:\/\//.test(url)) {
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error(`Download failed (${res.status}): ${url}`);
    await pipeline(Readable.fromWeb(res.body), createWriteStream(file));
  } else {
    const local = path.join("public", url.replace(/^\/+/, ""));
    if (!existsSync(local)) throw new Error(`Source not found: ${url}`);
    copyFileSync(local, file);
  }
  return file;
}

const trim = (s) => [...(s.start ? ["-ss", String(s.start)] : []), ...(s.duration ? ["-t", String(s.duration)] : [])];

async function upload(outDir) {
  const prefix = `frames/${job.slug}/v${job.version}`;
  const files = [];
  const walk = (d) => readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : files.push(path.join(d, e.name))));
  walk(outDir);

  if (!useBlob) {
    const dest = path.join("public", prefix);
    rmSync(dest, { recursive: true, force: true });
    for (const f of files) {
      const to = path.join(dest, path.relative(outDir, f));
      mkdirSync(path.dirname(to), { recursive: true });
      copyFileSync(f, to);
    }
    return "/frames";
  }

  const { put, list, del } = await import("@vercel/blob");
  const type = (f) => (f.endsWith(".mp4") ? "video/mp4" : "image/webp");
  let base = "";
  const queue = [...files];
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const f = queue.shift();
      const key = `${prefix}/${path.relative(outDir, f).split(path.sep).join("/")}`;
      const blob = await put(key, readFileSync(f), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: type(f),
        // Versioned paths never change, so browsers may keep them for a year.
        cacheControlMaxAge: 31536000,
      });
      base ||= blob.url.slice(0, blob.url.indexOf(`/${job.slug}/v${job.version}/`));
    }
  });
  await Promise.all(workers);
  console.log(`uploaded ${files.length} files to ${base}`);

  // Older versions of this walkthrough are no longer referenced.
  let cursor;
  do {
    const page = await list({ prefix: `frames/${job.slug}/`, cursor, limit: 1000 });
    const stale = page.blobs.filter((b) => !b.pathname.startsWith(`${prefix}/`)).map((b) => b.url);
    if (stale.length) await del(stale);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return base;
}

const work = mkdtempSync(path.join(tmpdir(), "vf-story-"));
try {
  const fps = Number(job.fps) || 24;
  const out = path.join(work, "out");
  const scenes = [];
  for (const [i, source] of job.sources.entries()) {
    const src = await fetchSource(source.url, work, i);
    const counts = [];
    for (const { name, width, quality } of FRAME_SIZES) {
      const dir = path.join(out, `scene${i + 1}`, name);
      mkdirSync(dir, { recursive: true });
      // Trim after -i so the cut is frame-accurate.
      ff("-i", src, ...trim(source), "-vf", `fps=${fps},scale=${width}:-2`, "-fps_mode", "passthrough", "-c:v", "libwebp", "-quality", String(quality), `${dir}/%04d.webp`);
      counts.push(readdirSync(dir).length);
    }
    if (counts[0] !== counts[1] || !counts[0]) throw new Error(`Scene ${i + 1}: frame counts differ (${counts.join(" / ")})`);
    scenes.push(counts[0]);
    console.log(`scene ${i + 1}: ${counts[0]} frames`);
    if (i === 0) ff("-i", src, ...trim(source), "-frames:v", "1", "-vf", "scale=1440:-2", "-c:v", "libwebp", "-quality", "82", path.join(out, "poster.webp"));
  }
  encodeMobileVideo(scenes.map((_, i) => path.join(out, `scene${i + 1}`)), fps, path.join(out, "mobile.mp4"));
  console.log(`mobile.mp4: ${(statSync(path.join(out, "mobile.mp4")).size / 1048576).toFixed(2)} MB`);

  const base = await upload(out);
  await report({ status: "ready", scenes, base, fps });
} catch (err) {
  console.error(err);
  await report({ status: "failed", error: String(err?.message ?? err).slice(0, 500) }).catch((e) => console.error(e));
  process.exitCode = 1;
} finally {
  rmSync(work, { recursive: true, force: true });
}
