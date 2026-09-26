"use server";

import { revalidatePath } from "next/cache";
import { isValidObjectId } from "mongoose";
import { requireAdmin } from "@/auth";
import { connectDB } from "@/lib/db";
import { snapshot } from "@/lib/revisions";
import type { FormState } from "@/lib/validators";
import { Article, Project, Revision, Service, SiteContent } from "@/models";

/** Put an earlier version back. The current one is kept first, so a restore can itself be undone. */
export async function restoreRevision(revisionId: string): Promise<FormState> {
  await requireAdmin();
  if (!isValidObjectId(revisionId)) return { ok: false, message: "Unknown version." };
  await connectDB();
  const rev = await Revision.findById(revisionId).lean();
  if (!rev) return { ok: false, message: "That version is no longer kept." };
  const data = rev.data as Record<string, unknown>;

  try {
    if (rev.kind === "project") {
      const doc = await Project.findById(rev.refId);
      if (!doc) return { ok: false, message: "The project no longer exists." };
      await snapshot("project", rev.refId, doc.title, doc.toObject());
      // Position in the list and the preview link belong to the project now, not to the old copy.
      const { order: _o, previewToken: _t, ...rest } = data;
      doc.set(rest);
      await doc.save();
    } else if (rev.kind === "service") {
      const doc = await Service.findById(rev.refId);
      if (!doc) return { ok: false, message: "The service no longer exists." };
      await snapshot("service", rev.refId, doc.title, doc.toObject());
      doc.set(data);
      await doc.save();
    } else if (rev.kind === "article") {
      const doc = await Article.findById(rev.refId);
      if (!doc) return { ok: false, message: "The article no longer exists." };
      await snapshot("article", rev.refId, doc.title, doc.toObject());
      doc.set(data);
      await doc.save();
    } else {
      const current = await SiteContent.findOne({ key: "main" }).lean();
      await snapshot("site", "main", "Site content", current);
      await SiteContent.updateOne({ key: "main" }, { $set: { ...data, key: "main" } }, { upsert: true });
    }
  } catch (err) {
    if ((err as { code?: number }).code === 11000) return { ok: false, message: "Another project now uses that version's slug — change one of them first." };
    return { ok: false, message: (err as Error).message };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Restored." };
}
