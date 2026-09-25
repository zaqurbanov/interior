import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Story } from "@/models";

// The frame job (scripts/process-story.mjs) reports here when it finishes.
// Authenticated by an HMAC of the body with STORY_WEBHOOK_SECRET.

const resultSchema = z.object({
  storyId: z.string(),
  version: z.number().int().positive(),
  status: z.enum(["ready", "failed"]),
  scenes: z.array(z.number().int().positive()).optional(),
  base: z.string().max(300).optional(),
  fps: z.number().int().min(1).max(60).optional(),
  error: z.string().max(1000).optional(),
});

function signed(body: string, signature: string | null) {
  const secret = process.env.STORY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(body).digest("hex"));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function POST(request: Request) {
  const body = await request.text();
  if (!signed(body, request.headers.get("x-signature"))) return NextResponse.json({ error: "Bad signature." }, { status: 401 });
  const parsed = resultSchema.safeParse(JSON.parse(body));
  if (!parsed.success || !isValidObjectId(parsed.data.storyId)) return NextResponse.json({ error: "Bad payload." }, { status: 400 });
  const r = parsed.data;

  await connectDB();
  const story = await Story.findById(r.storyId);
  // Only the latest job may land; an older run finishing late is ignored.
  if (!story || story.job.version !== r.version) return NextResponse.json({ ok: true, ignored: true });

  if (r.status === "failed") {
    story.job = { status: "failed", version: r.version, error: r.error || "Frame extraction failed.", startedAt: story.job.startedAt };
  } else {
    const base = r.base || "/frames";
    if (!(base === "/frames" || /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\/frames$/.test(base))) {
      return NextResponse.json({ error: "Unexpected frame location." }, { status: 400 });
    }
    story.version = r.version;
    story.base = base;
    story.scenes = r.scenes ?? [];
    story.framesAt = new Date();
    story.fps = r.fps ?? story.extractFps;
    // New footage: hand-tuned pauses and height belonged to the old frames.
    story.pauses = [];
    story.scrollVh = 0;
    // Stage positions must stay on the (possibly shorter) new timeline.
    const last = story.scenes.reduce((n, f) => n + f, 0) + story.hold * Math.max(0, story.scenes.length - 1) - 1;
    story.stages = story.stages.map((s) => ({ ...s, at: Math.min(s.at, Math.max(0, last)) }));
    story.job = { status: "idle", version: r.version, error: "", startedAt: story.job.startedAt };
  }
  await story.save();
  revalidatePath(`/projects/${story.slug}`);
  revalidatePath("/admin", "layout");
  return NextResponse.json({ ok: true });
}
