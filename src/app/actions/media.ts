"use server";

import path from "node:path";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/auth";
import { connectDB } from "@/lib/db";
import { collectUsage, listLibrary } from "@/lib/media";
import { deleteUpload, isAllowedImageUrl, isStoredUrl } from "@/lib/storage";
import type { MediaItem } from "@/lib/types";
import { Media } from "@/models";

type Result = { ok: boolean; message: string };

const registerSchema = z.object({
  url: z.string().refine(isStoredUrl, "Not an uploaded file."),
  name: z.string().max(200),
  contentType: z.string().max(100),
  size: z.number().int().min(0),
  width: z.number().int().min(0),
  height: z.number().int().min(0),
});

/** Called by the browser right after a file reaches storage. */
export async function registerMedia(input: z.input<typeof registerSchema>): Promise<Result> {
  await requireAdmin();
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  await connectDB();
  const { url, ...meta } = parsed.data;
  await Media.updateOne({ url }, { $set: meta, $setOnInsert: { url, alt: "" } }, { upsert: true });
  revalidatePath("/admin/media");
  return { ok: true, message: "" };
}

export async function listMedia(): Promise<MediaItem[]> {
  await requireAdmin();
  return listLibrary();
}

export async function saveMediaAlt(url: string, alt: string): Promise<Result> {
  await requireAdmin();
  if (!isAllowedImageUrl(url)) return { ok: false, message: "Unknown image." };
  const text = alt.trim().slice(0, 300);
  await connectDB();
  await Media.updateOne(
    { url },
    { $set: { alt: text }, $setOnInsert: { url, name: path.basename(url) } },
    { upsert: true },
  );
  // Alt text is rendered on the public pages.
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved" };
}

export async function deleteMedia(url: string): Promise<Result> {
  await requireAdmin();
  if (!isStoredUrl(url)) return { ok: false, message: "Only uploaded files can be deleted." };
  const usedBy = (await collectUsage()).get(url);
  if (usedBy?.length) return { ok: false, message: `Still used by: ${usedBy.map((u) => u.label).join(", ")}` };
  await deleteUpload(url);
  await Media.deleteOne({ url });
  revalidatePath("/admin/media");
  return { ok: true, message: "Deleted" };
}
