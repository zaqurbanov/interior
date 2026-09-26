import "server-only";
import { Article, Project } from "@/models";

/** What the article form offers: projects to link and categories already used. */
export async function articleFormOptions() {
  const [projects, categories] = await Promise.all([
    Project.find({}, { slug: 1, title: 1 }).sort({ order: 1 }).lean(),
    Article.distinct("category"),
  ]);
  return {
    projects: projects.map((p) => ({ slug: p.slug, title: p.title })),
    categories: (categories as string[]).filter(Boolean).sort(),
  };
}
