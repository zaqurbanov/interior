import "server-only";
import path from "node:path";
import { connectDB } from "./db";
import { deleteUpload, isStoredUrl } from "./storage";
import type { MediaItem, MediaUsage } from "./types";
import { Media, Project, Service, SiteContent } from "@/models";

/** Every image URL the database refers to, with where it is used. */
export async function collectUsage(): Promise<Map<string, MediaUsage[]>> {
  await connectDB();
  const [projects, services, site] = await Promise.all([
    Project.find({}, { title: 1, coverImage: 1, gallery: 1 }).lean(),
    Service.find({}, { title: 1, image: 1 }).lean(),
    SiteContent.findOne({ key: "main" }, { seo: 1, team: 1 }).lean(),
  ]);

  const usage = new Map<string, MediaUsage[]>();
  const add = (url: string | undefined, label: string, href: string) => {
    if (!url) return;
    const list = usage.get(url) ?? [];
    if (!list.some((u) => u.label === label)) list.push({ label, href });
    usage.set(url, list);
  };

  for (const p of projects) {
    const href = `/admin/projects/${p._id}`;
    add(p.coverImage, `${p.title} — cover`, href);
    for (const g of p.gallery ?? []) add(g, `${p.title} — gallery`, href);
  }
  for (const s of services) add(s.image, `${s.title} — service image`, `/admin/services/${s._id}`);
  add(site?.seo?.ogImage, "Social sharing image", "/admin/content#brand");
  for (const m of site?.team ?? []) add(m.photo, `${m.name || "Team member"} — photo`, "/admin/content#team");
  return usage;
}

/**
 * Delete uploaded files that nothing refers to any more (called with the URLs a
 * save just dropped). A library image can be picked in several places, so a
 * file is only removed once no project, service or content block uses it.
 */
export async function deleteIfUnused(urls: string[]) {
  const candidates = [...new Set(urls.filter(isStoredUrl))];
  if (!candidates.length) return;
  const usage = await collectUsage();
  const unused = candidates.filter((u) => !usage.has(u));
  await Promise.all(unused.map(deleteUpload));
  if (unused.length) await Media.deleteMany({ url: { $in: unused } });
}

/** The library: registered uploads plus every image the content refers to. */
export async function listLibrary(): Promise<MediaItem[]> {
  const usage = await collectUsage();
  const docs = await Media.find().sort({ createdAt: -1 }).lean();
  const byUrl = new Map(docs.map((d) => [d.url, d]));

  const urls = [...docs.map((d) => d.url), ...[...usage.keys()].filter((u) => !byUrl.has(u))];
  return urls.map((url) => {
    const d = byUrl.get(url);
    return {
      url,
      name: d?.name || path.basename(url.split("?")[0]),
      alt: d?.alt ?? "",
      size: d?.size ?? 0,
      width: d?.width ?? 0,
      height: d?.height ?? 0,
      createdAt: d?.createdAt ? new Date(d.createdAt).toISOString() : null,
      usedBy: usage.get(url) ?? [],
      stored: isStoredUrl(url),
    };
  });
}
