import type { MetadataRoute } from "next";
import { getProjects, getServices, siteUrl } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = siteUrl();
  const [projects, services] = await Promise.all([getProjects(), getServices()]);
  const now = new Date();
  return [
    { url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${url}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${url}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    ...services.map((s) => ({ url: `${url}/services/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...projects.map((p) => ({
      url: `${url}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      // Image sitemap entries, so the renders can surface in image search.
      images: [p.coverImage, ...p.gallery].filter(Boolean).map((src) => `${url}${src}`),
    })),
  ];
}
