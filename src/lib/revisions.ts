import "server-only";
import { auth } from "@/auth";
import { Revision } from "@/models";
import { articleImages } from "./rich-text";

// Version history: before a project, service or the site content is saved, the
// stored copy is kept here (newest KEEP per item), so an edit can be undone.
// Images in kept copies count as "in use" (lib/media.ts), so restoring never
// brings back a deleted file.

export type RevisionKind = "project" | "service" | "site" | "article";
const KEEP = 20;
const ADMIN_PATHS: Record<string, string> = { project: "projects", service: "services", article: "articles" };

/** Store the pre-save state of a document. */
export async function snapshot(kind: RevisionKind, refId: string, label: string, doc: object | null | undefined) {
  if (!doc) return;
  const { _id, __v, createdAt, updatedAt, ...data } = doc as Record<string, unknown>;
  void _id, __v, createdAt, updatedAt;
  const author = (await auth())?.user?.email ?? "";
  await Revision.create({ kind, refId, label, author, data });
  const old = await Revision.find({ kind, refId }, { _id: 1 }).sort({ createdAt: -1 }).skip(KEEP).lean();
  if (old.length) await Revision.deleteMany({ _id: { $in: old.map((r) => r._id) } });
}

export type RevisionItem = { id: string; label: string; author: string; createdAt: string };

export async function listRevisions(kind: RevisionKind, refId: string): Promise<RevisionItem[]> {
  const docs = await Revision.find({ kind, refId }, { label: 1, author: 1, createdAt: 1 }).sort({ createdAt: -1 }).lean();
  return docs.map((d) => ({ id: String(d._id), label: d.label, author: d.author, createdAt: new Date(d.createdAt ?? Date.now()).toISOString() }));
}

/** Image URLs held by kept copies. */
export async function revisionImageUrls(): Promise<{ url: string; label: string; href: string }[]> {
  const docs = await Revision.find({}, { kind: 1, refId: 1, label: 1, data: 1 }).lean();
  const out: { url: string; label: string; href: string }[] = [];
  for (const r of docs) {
    const d = (r.data ?? {}) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    const urls: unknown[] =
      r.kind === "project"
        ? [d.coverImage, ...(d.gallery ?? [])]
        : r.kind === "service"
          ? [d.image]
          : r.kind === "article"
            ? [d.coverImage, ...articleImages(String(d.content ?? ""))]
            : [d.seo?.ogImage, ...((d.team ?? []) as { photo?: string }[]).map((m) => m.photo)];
    const href = r.kind === "site" ? "/admin/content" : `/admin/${ADMIN_PATHS[r.kind] ?? "projects"}/${r.refId}`;
    for (const u of urls) if (typeof u === "string" && u) out.push({ url: u, label: r.label, href });
  }
  return out;
}
