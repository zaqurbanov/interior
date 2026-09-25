// Copies public/frames (home and built-in walkthrough frames, posters, phone
// MP4s) to Vercel Blob under frames/, keeping the same relative paths, so the
// site can serve them from Blob instead of the repo.
//
//   node --env-file=.env.local scripts/frames-to-blob.mjs            # upload
//   node --env-file=.env.local scripts/frames-to-blob.mjs --dry-run  # only count
//
// Needs BLOB_READ_WRITE_TOKEN. Files already in Blob are skipped, so it can be
// re-run after an interruption. At the end it prints the NEXT_PUBLIC_FRAMES_BASE
// value to set in Vercel (all environments) and .env.local; after a redeploy the
// site loads frames from Blob. Only then remove public/frames from git — see
// tasks/kadrlari-blob-a-kocurmek.md.
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public", "frames");
const dryRun = process.argv.includes("--dry-run");

const TYPES = { ".webp": "image/webp", ".mp4": "video/mp4", ".jpg": "image/jpeg", ".png": "image/png" };

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const files = walk(ROOT)
  .filter((f) => TYPES[path.extname(f).toLowerCase()])
  .map((f) => ({ file: f, key: `frames/${path.relative(ROOT, f).split(path.sep).join("/")}` }));
const bytes = files.reduce((n, f) => n + statSync(f.file).size, 0);
console.log(`${files.length} files, ${(bytes / 1024 / 1024).toFixed(0)} MB in public/frames`);

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN is not set (run with --env-file=.env.local).");
  process.exit(1);
}

const { put, list } = await import("@vercel/blob");

// What is already there, so a re-run only uploads the rest.
const existing = new Set();
let base = "";
let cursor;
do {
  const page = await list({ prefix: "frames/", cursor, limit: 1000 });
  for (const b of page.blobs) {
    existing.add(b.pathname);
    base ||= b.url.slice(0, b.url.indexOf("/frames/") + "/frames".length);
  }
  cursor = page.hasMore ? page.cursor : undefined;
} while (cursor);

const todo = files.filter((f) => !existing.has(f.key));
console.log(`${files.length - todo.length} already in Blob, ${todo.length} to upload`);
if (dryRun) process.exit(0);

let done = 0;
let failed = 0;
const queue = [...todo];
const workers = Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const f = queue.shift();
    try {
      const blob = await put(f.key, readFileSync(f.file), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: TYPES[path.extname(f.file).toLowerCase()],
        // Frame paths are versioned or never change: cache for a year, like /frames on Vercel.
        cacheControlMaxAge: 31536000,
      });
      base ||= blob.url.slice(0, blob.url.indexOf("/frames/") + "/frames".length);
    } catch (err) {
      failed++;
      console.error(`\n${f.key}: ${err.message}`);
    }
    if (++done % 100 === 0 || done === todo.length) process.stdout.write(`\r${done}/${todo.length} uploaded`);
  }
});
await Promise.all(workers);
console.log();

if (failed) {
  console.error(`${failed} files failed — run the script again to retry them.`);
  process.exit(1);
}
console.log("All frames are in Blob. Set this in Vercel (Production, Preview, Development) and .env.local, then redeploy:");
console.log(`\n  NEXT_PUBLIC_FRAMES_BASE=${base}\n`);
