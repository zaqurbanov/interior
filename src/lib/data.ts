import "server-only";
import { connectDB, isDbConfigured } from "./db";
import { Message, Project, Service, SiteContent } from "@/models";
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
    featured: Boolean(d.featured),
    published: d.published !== false,
    order: Number(d.order ?? 0),
    seo: { title: str(d.seo?.title), description: str(d.seo?.description) },
  };
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

function mergeSite(d: any): SiteContentData {
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
  return withDb(async () => mergeSite(await SiteContent.findOne({ key: "main" }).lean()), defaultSiteContent);
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
    const q: Record<string, unknown> = {};
    if (!opts.includeUnpublished) q.published = true;
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
      const d = await Project.findOne({ slug, published: true }).lean();
      return d ? toProject(d) : null;
    },
    defaultProjects.find((p) => p.slug === slug) ?? null,
  );
}

export async function getMessages(): Promise<MessageData[]> {
  await connectDB();
  const docs = await Message.find().sort({ createdAt: -1 }).lean();
  return docs.map(toMessage);
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
