import "server-only";
import { spawn } from "node:child_process";
import { siteUrl } from "./data";

// Where frame extraction runs (scripts/process-story.mjs needs ffmpeg, which
// Vercel functions do not have):
//   github — dispatches .github/workflows/story-frames.yml; frames go to Blob
//            (needs GITHUB_ACTIONS_TOKEN with "Actions: write" on GITHUB_REPO)
//   local  — runs the script on this server (self-hosted, or `npm run dev`
//            with ffmpeg installed); frames go to Blob or public/frames
// FRAME_JOB_DRIVER picks one; otherwise github when a token is set, local off Vercel.

export type FrameJob = { storyId: string; slug: string; version: number; fps: number; sources: { url: string; start: number; duration: number }[] };

export function frameJobDriver(): "github" | "local" | null {
  const forced = process.env.FRAME_JOB_DRIVER;
  if (forced === "github" || forced === "local") return forced;
  if (process.env.GITHUB_ACTIONS_TOKEN) return "github";
  return process.env.VERCEL ? null : "local";
}

const callbackUrl = () => `${siteUrl()}/api/story-job`;

export async function startFrameJob(job: FrameJob) {
  if (!process.env.STORY_WEBHOOK_SECRET) throw new Error("STORY_WEBHOOK_SECRET is not set.");
  const driver = frameJobDriver();
  if (!driver) throw new Error("No frame job runner: set GITHUB_ACTIONS_TOKEN and GITHUB_REPO (see .env.example).");

  if (driver === "github") {
    const repo = process.env.GITHUB_REPO;
    if (!repo || !process.env.GITHUB_ACTIONS_TOKEN) throw new Error("GITHUB_REPO and GITHUB_ACTIONS_TOKEN must be set.");
    const res = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/story-frames.yml/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_ACTIONS_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ ref: process.env.FRAME_JOB_REF || "master", inputs: { job: JSON.stringify(job), callback: callbackUrl() } }),
    });
    if (!res.ok) throw new Error(`GitHub refused the job (${res.status}): ${(await res.text()).slice(0, 200)}`);
    return;
  }

  // Detached, so the request returns at once; the script reports back to the callback.
  const child = spawn(process.execPath, ["scripts/process-story.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, STORY_JOB: JSON.stringify(job), STORY_CALLBACK: callbackUrl() },
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}
