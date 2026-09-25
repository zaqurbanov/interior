import "server-only";
import { connectDB, isDbConfigured } from "./db";
import { Media, Message, Project, Service, SiteContent } from "@/models";
import { defaultProjects, defaultServices, defaultSiteContent } from "./defaults";
import type { MessageData, ProjectData, ServiceData, SiteContentData } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const str = (v: any) => (v == null ? "" : String(v));

export function toProject(d: any): ProjectData {
  return {
    id: str(d._id),
    title: str(d.title),
    slug: str(d.slug),
    subtitle: str(d.subtitle),
    location: str(d.location),
    category: str(d.category),
    year: str(d.year),
    summary: str(d.summary),
    content: str(d.content),
    coverImage: str(d.coverImage),
    gallery: (d.gallery ?? []).map(str),
    videos: (d.videos ?? []).map(str),
    highlights: (d.highlights ?? []).map(str),
    featured: Boolean(d.featured),
    published: d.published !== false,
    order: Number(d.order ?? 0),
    seo: { title: str(d.seo?.title), description: str(d.seo?.description) },
    publishAt: d.publishAt ? new Date(d.publishAt).toISOString() : "",
    previewToken: str(d.previewToken),
  };
}

/** Query for projects visitors may see: published, and past any scheduled date. */
export const liveProjectQuery = () => ({
  published: true,
  $or: [{ publishAt: null }, { publishAt: { $exists: false } }, { publishAt: { $lte: new Date() } }],
});

/** Draft, scheduled or live — for the admin list. */
export function projectStatus(p: Pick<ProjectData, "published" | "publishAt">): "draft" | "scheduled" | "live" {
  if (!p.published) return "draft";
  return p.publishAt && new Date(p.publishAt) > new Date() ? "scheduled" : "live";
}

export function toService(d: any): ServiceData {
  return {
    id: str(d._id),
    title: str(d.title),
    slug: str(d.slug),
    icon: str(d.icon),
    image: str(d.image),
    summary: str(d.summary),
    content: str(d.content),
    features: (d.features ?? []).map(str).filter(Boolean),
    order: Number(d.order ?? 0),
    published: d.published !== false,
    seo: { title: str(d.seo?.title), description: str(d.seo?.description) },
  };
}

export function toMessage(d: any): MessageData {
  return {
    id: str(d._id),
    name: str(d.name),
    email: str(d.email),
    phone: str(d.phone),
    subject: str(d.subject),
    body: str(d.body),
    read: Boolean(d.read),
    createdAt: new Date(d.createdAt ?? Date.now()).toISOString(),
  };
}

export function toSiteContent(d: any): SiteContentData {
  const def = defaultSiteContent;
  const pick = (v: any, fallback: string) => (v ? String(v) : fallback);
  return {
    brandName: pick(d?.brandName, def.brandName),
    tagline: pick(d?.tagline, def.tagline),
    // The scroll timeline needs one stage per STAGE_AT entry; fill gaps from defaults.
    heroStages: def.heroStages.map((fallback, i) => {
      const s = d?.heroStages?.[i];
      return s?.title ? { eyebrow: str(s.eyebrow), title: str(s.title), text: str(s.text) } : fallback;
    }),
    aboutTitle: pick(d?.aboutTitle, def.aboutTitle),
    aboutText: pick(d?.aboutText, def.aboutText),
    portfolioIntro: pick(d?.portfolioIntro, def.portfolioIntro),
    showreel: str(d?.showreel ?? def.showreel),
    team: d?.team?.length
      ? d.team.map((t: any) => ({ name: str(t.name), role: str(t.role), bio: str(t.bio), photo: str(t.photo) }))
      : def.team,
    stats: d?.stats?.length ? d.stats.map((s: any) => ({ value: str(s.value), label: str(s.label) })) : def.stats,
    process: d?.process?.length ? d.process.map((s: any) => ({ title: str(s.title), text: str(s.text) })) : def.process,
    contact: {
      email: pick(d?.contact?.email, def.contact.email),
      phone: pick(d?.contact?.phone, def.contact.phone),
      address: pick(d?.contact?.address, def.contact.address),
    },
    socials: {
      instagram: str(d?.socials?.instagram ?? def.socials.instagram),
      linkedin: str(d?.socials?.linkedin ?? def.socials.linkedin),
      youtube: str(d?.socials?.youtube ?? def.socials.youtube),
    },
    seo: {
      title: pick(d?.seo?.title, def.seo.title),
      description: pick(d?.seo?.description, def.seo.description),
      keywords: pick(d?.seo?.keywords, def.seo.keywords),
      ogImage: pick(d?.seo?.ogImage, def.seo.ogImage),
    },
  };
}

async function withDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return fallback;
  try {
    await connectDB();
    return await fn();
  } catch (err) {
    console.error("[data] database unavailable, using default content:", (err as Error).message);
    return fallback;
  }
}

export function getSiteContent(): Promise<SiteContentData> {
  return withDb(async () => toSiteContent(await SiteContent.findOne({ key: "main" }).lean()), defaultSiteContent);
}

export function getServices(includeUnpublished = false): Promise<ServiceData[]> {
  return withDb(async () => {
    const docs = await Service.find(includeUnpublished ? {} : { published: true }).sort({ order: 1 }).lean();
    return docs.length || includeUnpublished ? docs.map(toService) : defaultServices;
  }, defaultServices);
}

export function getService(slug: string): Promise<ServiceData | null> {
  return withDb(
    async () => {
      const d = await Service.findOne({ slug, published: true }).lean();
      return d ? toService(d) : null;
    },
    defaultServices.find((s) => s.slug === slug) ?? null,
  );
}

export function getProjects(opts: { featured?: boolean; includeUnpublished?: boolean } = {}): Promise<ProjectData[]> {
  const fallback = opts.featured ? defaultProjects.filter((p) => p.featured) : defaultProjects;
  return withDb(async () => {
    const q: Record<string, unknown> = opts.includeUnpublished ? {} : liveProjectQuery();
    if (opts.featured) q.featured = true;
    const docs = await Project.find(q).sort({ order: 1, createdAt: -1 }).lean();
    if (!docs.length && !opts.includeUnpublished) {
      const total = await Project.estimatedDocumentCount();
      return total ? [] : fallback;
    }
    return docs.map(toProject);
  }, fallback);
}

export function getProject(slug: string): Promise<ProjectData | null> {
  return withDb(
    async () => {
      const d = await Project.findOne({ slug, ...liveProjectQuery() }).lean();
      return d ? toProject(d) : null;
    },
    defaultProjects.find((p) => p.slug === slug) ?? null,
  );
}

/** A project in any state, if the preview token matches (draft preview links). */
export async function getProjectPreview(slug: string, token: string): Promise<ProjectData | null> {
  if (!token || !isDbConfigured()) return null;
  await connectDB();
  const d = await Project.findOne({ slug, previewToken: token }).lean();
  return d ? toProject(d) : null;
}

export async function getMessages(): Promise<MessageData[]> {
  await connectDB();
  const docs = await Message.find().sort({ createdAt: -1 }).lean();
  return docs.map(toMessage);
}

/** Alt text edited in the media library, by image URL. Pages fall back to a
 *  generated description ("Title — image 3") where none is set. */
export function getImageAlts(): Promise<Record<string, string>> {
  return withDb(async () => {
    const docs = await Media.find({ alt: { $ne: "" } }, { url: 1, alt: 1 }).lean();
    return Object.fromEntries(docs.map((d) => [d.url, d.alt]));
  }, {});
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
