"use server";

import { revalidatePath } from "next/cache";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { requireAdmin } from "@/auth";
import { connectDB } from "@/lib/db";
import { deleteIfUnused } from "@/lib/media";
import { deleteBlobPrefix } from "@/lib/storage";
import { getProjectStory } from "@/lib/project-story";
import type { FormState } from "@/lib/validators";
import { Project, Story } from "@/models";

// Walkthrough editor (admin → project → Walkthrough): copy, stage positions and
// timing of a built-in walkthrough. Frames themselves are made on a computer
// with scripts/extract-project-frames.mjs (see docs/animasiya-yaratmaq.md).

const fail = (e: unknown): FormState => ({ ok: false, message: e instanceof Error ? e.message : "Something went wrong." });

async function projectSlug(projectId: string) {
  await requireAdmin();
  if (!isValidObjectId(projectId)) throw new Error("Unknown project.");
  await connectDB();
  const p = await Project.findById(projectId, { slug: 1 }).lean();
  if (!p) throw new Error("Unknown project.");
  return p.slug;
}

const revalidate = (slug: string) => {
  revalidatePath(`/projects/${slug}`);
  revalidatePath("/admin", "layout");
};

/** Start editing a built-in walkthrough: copy it into the database. */
export async function createStory(projectId: string): Promise<FormState> {
  try {
    const slug = await projectSlug(projectId);
    if (await Story.exists({ slug })) return { ok: true, message: "" };
    const code = getProjectStory(slug);
    if (!code) return { ok: false, message: "This project has no walkthrough yet — it is added in code with its frames." };
    await Story.create({
      slug,
      version: code.version,
      base: "/frames",
      fps: code.fps ?? 24,
      extractFps: code.fps ?? 24,
      hold: code.hold,
      scenes: code.scenes,
      stages: code.stages,
      pauses: code.pauses ?? [],
      scrollVh: code.scrollVh ?? 0,
      enabled: true,
    });
    revalidate(slug);
    return { ok: true, message: "" };
  } catch (e) {
    return fail(e);
  }
}

const contentSchema = z.object({
  enabled: z.boolean(),
  hold: z.number().int().min(0).max(240),
  stages: z
    .array(
      z.object({
        at: z.number().int().min(0),
        eyebrow: z.string().trim().max(80),
        title: z.string().trim().min(1, "Every stage needs a title").max(140),
        text: z.string().trim().max(500),
        label: z.string().trim().max(60),
        facts: z.array(z.string().trim().min(1).max(120)).max(8),
      }),
    )
    .max(20),
});

/** Stage copy, positions, the hold between scenes, and whether it shows on the site. */
export async function saveStoryContent(projectId: string, input: z.input<typeof contentSchema>): Promise<FormState> {
  try {
    const slug = await projectSlug(projectId);
    const parsed = contentSchema.safeParse(input);
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
    const story = await Story.findOne({ slug });
    if (!story) return { ok: false, message: "Unknown walkthrough." };
    const { enabled, hold, stages } = parsed.data;
    if (enabled && (!story.version || !stages.length)) return { ok: false, message: "It needs frames and at least one stage before it can go live." };

    const last = story.scenes.reduce((n, f) => n + f, 0) + hold * Math.max(0, story.scenes.length - 1) - 1;
    const sorted = [...stages].sort((a, b) => a.at - b.at).map((s) => ({ ...s, at: Math.min(s.at, Math.max(0, last)) }));
    // The opening stage is on screen from the start.
    if (sorted[0]) sorted[0].at = 0;
    story.set({ enabled, hold, stages: sorted });
    await story.save();
    revalidate(slug);
    return { ok: true, message: "Saved — the project page is updated." };
  } catch (e) {
    return fail(e);
  }
}

/** Drop the admin edits; the built-in walkthrough shows again. Older admin-made ones lose their Blob frames. */
export async function deleteStory(projectId: string): Promise<FormState> {
  try {
    const slug = await projectSlug(projectId);
    const story = await Story.findOneAndDelete({ slug });
    if (story) {
      await deleteIfUnused(story.sources.map((s) => s.url));
      // Generated frames live in Blob; built-in ones (base "/frames") are in the repo.
      if (story.base.startsWith("https://")) await deleteBlobPrefix(`frames/${slug}/`);
    }
    revalidate(slug);
    return { ok: true, message: "Removed." };
  } catch (e) {
    return fail(e);
  }
}
