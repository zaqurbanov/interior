// ffmpeg helpers shared by the frame and video scripts.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export const FFMPEG = process.env.FFMPEG || "ffmpeg";

export const ff = (...args) => execFileSync(FFMPEG, ["-v", "error", "-y", ...args], { stdio: "inherit" });

/** Frame sizes: desktop scrubs 1440px frames, phones get 860px (and the MP4). */
export const FRAME_SIZES = [
  { name: "desktop", width: 1440, quality: 50 },
  { name: "mobile", width: 860, quality: 68 },
];

/** H.264 of the mobile frames of the given scene folders, in order (see build-mobile-videos.mjs). */
export function encodeMobileVideo(sceneDirs, fps, out) {
  // Number every frame of every scene into one continuous sequence.
  const tmp = mkdtempSync(path.join(tmpdir(), "vf-frames-"));
  let n = 0;
  for (const dir of sceneDirs) {
    for (const f of readdirSync(path.join(dir, "mobile")).filter((f) => f.endsWith(".webp")).sort()) {
      symlinkSync(path.resolve(dir, "mobile", f), path.join(tmp, `${String(++n).padStart(5, "0")}.webp`));
    }
  }
  mkdirSync(path.dirname(out), { recursive: true });
  ff(
    "-framerate", String(fps),
    "-i", path.join(tmp, "%05d.webp"),
    "-c:v", "libx264", "-preset", "slow", "-crf", "27",
    "-profile:v", "high", "-level", "4.0", "-pix_fmt", "yuv420p",
    // Keyframes every 4 s: frequent enough for Replay, far cheaper than every second.
    "-g", String(fps * 4), "-movflags", "+faststart", "-an",
    out,
  );
  rmSync(tmp, { recursive: true, force: true });
  return n;
}
