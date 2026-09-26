"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { requireAdmin } from "@/auth";
import { connectDB } from "@/lib/db";
import { deleteIfUnused } from "@/lib/media";
import { snapshot } from "@/lib/revisions";
import { articleImages, sanitizeArticle } from "@/lib/rich-text";
import { articleSchema, type FormState } from "@/lib/validators";
import { Article } from "@/models";

/** Pages, plus the sitemap and feed (route handlers are outside the layout's revalidation). */
function revalidateJournal() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/journal/rss.xml");
}

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "");
const list = (v: string) => [...new Set(v.split(",").map((t) => t.trim()).filter(Boolean))];

export async function saveArticle(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = articleSchema.safeParse({
    title: text(fd, "title"),
    slug: text(fd, "slug"),
    excerpt: text(fd, "excerpt"),
    content: sanitizeArticle(text(fd, "content")),
    coverImage: text(fd, "coverImage"),
    category: text(fd, "category"),
    tags: list(text(fd, "tags")),
    author: text(fd, "author"),
    projects: fd.getAll("projects").map(String),
    publishAt: text(fd, "publishAt"),
    published: fd.get("published") === "on",
    seoTitle: text(fd, "seoTitle"),
    seoDescription: text(fd, "seoDescription"),
  });
  if (!parsed.success) return { ok: false, message: "Please fix the errors below.", errors: parsed.error.flatten().fieldErrors };

  const { seoTitle, seoDescription, ...data } = parsed.data;
  const payload = { ...data, seo: { title: seoTitle, description: seoDescription } };
  try {
    await connectDB();
    if (id) {
      const existing = await Article.findById(id);
      if (!existing) return { ok: false, message: "Article not found." };
      const before = [existing.coverImage, ...articleImages(existing.content)];
      await snapshot("article", id, existing.title, existing.toObject());
      existing.set(payload);
      await existing.save();
      await deleteIfUnused(before);
    } else {
      await Article.create(payload);
    }
  } catch (err) {
    if ((err as { code?: number })?.code === 11000) return { ok: false, message: "That slug is already used.", errors: { slug: ["Slug must be unique"] } };
    return { ok: false, message: (err as Error).message };
  }
  revalidateJournal();
  redirect("/admin/articles");
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  if (!isValidObjectId(id)) return;
  await connectDB();
  const doc = await Article.findByIdAndDelete(id);
  if (doc) await deleteIfUnused([doc.coverImage, ...articleImages(doc.content)]);
  revalidateJournal();
}
