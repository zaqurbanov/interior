"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { requireAdmin } from "@/auth";
import { connectDB } from "@/lib/db";
import { STAGE_COUNT } from "@/lib/sequence";
import { deleteIfUnused } from "@/lib/media";
import { projectSchema, serviceSchema, siteContentSchema, type FormState } from "@/lib/validators";
import type { z } from "zod";
import { Message, Project, Service, SiteContent } from "@/models";

function revalidateSite() {
  revalidatePath("/", "layout");
}

const bool = (fd: FormData, k: string) => fd.get(k) === "on";
const text = (fd: FormData, k: string) => String(fd.get(k) ?? "");
const lines = (fd: FormData, k: string) => text(fd, k).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const dupKey = (err: unknown) => (err as { code?: number })?.code === 11000;

/* ---------------- Projects ---------------- */

export async function saveProject(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = projectSchema.safeParse({
    title: text(fd, "title"),
    slug: text(fd, "slug"),
    subtitle: text(fd, "subtitle"),
    videos: lines(fd, "videos"),
    location: text(fd, "location"),
    category: text(fd, "category"),
    year: text(fd, "year"),
    summary: text(fd, "summary"),
    content: text(fd, "content"),
    order: text(fd, "order") || 0,
    coverImage: text(fd, "coverImage"),
    gallery: fd.getAll("gallery").map(String),
    featured: bool(fd, "featured"),
    published: bool(fd, "published"),
    seoTitle: text(fd, "seoTitle"),
    seoDescription: text(fd, "seoDescription"),
  });
  if (!parsed.success) return { ok: false, message: "Please fix the errors below.", errors: parsed.error.flatten().fieldErrors };

  const { seoTitle, seoDescription, ...data } = parsed.data;
  try {
    await connectDB();
    const existing = id ? await Project.findById(id) : null;
    if (id && !existing) return { ok: false, message: "Project not found." };

    const before = existing ? [existing.coverImage, ...existing.gallery] : [];
    const payload = { ...data, seo: { title: seoTitle, description: seoDescription } };
    if (existing) {
      existing.set(payload);
      await existing.save();
    } else {
      await Project.create(payload);
    }
    // Images are uploaded as soon as they are chosen; files this save dropped go
    // now, unless another page still uses them.
    await deleteIfUnused(before);
  } catch (err) {
    if (dupKey(err)) return { ok: false, message: "That slug is already used.", errors: { slug: ["Slug must be unique"] } };
    return { ok: false, message: (err as Error).message };
  }
  revalidateSite();
  redirect("/admin/projects");
}

export async function deleteProject(id: string) {
  await requireAdmin();
  if (!isValidObjectId(id)) return;
  await connectDB();
  const doc = await Project.findByIdAndDelete(id);
  if (doc) await deleteIfUnused([doc.coverImage, ...doc.gallery]);
  revalidateSite();
}

/* ---------------- Services ---------------- */

export async function saveService(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse({
    title: text(fd, "title"),
    slug: text(fd, "slug"),
    icon: text(fd, "icon"),
    features: lines(fd, "features"),
    image: text(fd, "image"),
    summary: text(fd, "summary"),
    content: text(fd, "content"),
    order: text(fd, "order") || 0,
    published: bool(fd, "published"),
    seoTitle: text(fd, "seoTitle"),
    seoDescription: text(fd, "seoDescription"),
  });
  if (!parsed.success) return { ok: false, message: "Please fix the errors below.", errors: parsed.error.flatten().fieldErrors };

  const { seoTitle, seoDescription, ...data } = parsed.data;
  const payload = { ...data, seo: { title: seoTitle, description: seoDescription } };
  try {
    await connectDB();
    if (id) {
      // Returns the document as it was before the update.
      const prev = await Service.findByIdAndUpdate(id, payload, { runValidators: true });
      if (!prev) return { ok: false, message: "Service not found." };
      await deleteIfUnused([prev.image]);
    } else {
      await Service.create(payload);
    }
  } catch (err) {
    if (dupKey(err)) return { ok: false, message: "That slug is already used.", errors: { slug: ["Slug must be unique"] } };
    return { ok: false, message: (err as Error).message };
  }
  revalidateSite();
  redirect("/admin/services");
}

export async function deleteService(id: string) {
  await requireAdmin();
  if (!isValidObjectId(id)) return;
  await connectDB();
  const doc = await Service.findByIdAndDelete(id);
  if (doc) await deleteIfUnused([doc.image]);
  revalidateSite();
}

/* ---------------- Messages ---------------- */

export async function setMessageRead(id: string, read: boolean) {
  await requireAdmin();
  if (!isValidObjectId(id)) return;
  await connectDB();
  await Message.findByIdAndUpdate(id, { read });
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  if (!isValidObjectId(id)) return;
  await connectDB();
  await Message.findByIdAndDelete(id);
  revalidatePath("/admin", "layout");
}

/* ---------------- Site content & SEO ---------------- */

/** Zod issues as a flat map keyed by dotted path ("seo.title", "heroStages.2.title"). */
function issuesByPath(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

export async function saveSiteContent(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();

  // Repeated inputs arrive as parallel lists (stage.title[0], stage.title[1]…).
  const rows = <T extends string>(prefix: string, keys: T[]) => {
    const cols = keys.map((k) => fd.getAll(`${prefix}.${k}`).map((v) => String(v).trim()));
    return (cols[0] ?? []).map(
      (_, i) => Object.fromEntries(keys.map((k, j) => [k, cols[j][i] ?? ""])) as Record<T, string>,
    );
  };
  const nonEmpty = <T extends Record<string, string>>(list: T[]) => list.filter((r) => Object.values(r).some(Boolean));

  const input = {
    brandName: text(fd, "brandName"),
    tagline: text(fd, "tagline"),
    // Stage slots are fixed (they are tied to the homepage video), so keep them all.
    heroStages: rows("stage", ["eyebrow", "title", "text"]).slice(0, STAGE_COUNT),
    aboutTitle: text(fd, "aboutTitle"),
    aboutText: text(fd, "aboutText"),
    portfolioIntro: text(fd, "portfolioIntro"),
    showreel: text(fd, "showreel"),
    stats: nonEmpty(rows("stat", ["value", "label"])),
    process: nonEmpty(rows("process", ["title", "text"])),
    team: rows("team", ["name", "role", "bio", "photo"]).filter((r) => r.name || r.role || r.bio),
    contact: { email: text(fd, "contact.email").trim(), phone: text(fd, "contact.phone"), address: text(fd, "contact.address") },
    socials: {
      instagram: text(fd, "socials.instagram").trim(),
      linkedin: text(fd, "socials.linkedin").trim(),
      youtube: text(fd, "socials.youtube").trim(),
    },
    seo: {
      title: text(fd, "seo.title"),
      description: text(fd, "seo.description"),
      keywords: text(fd, "seo.keywords"),
      ogImage: text(fd, "seo.ogImage"),
    },
  };

  const parsed = siteContentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Some fields need attention — see the highlighted sections.", errors: issuesByPath(parsed.error) };
  }
  const data = parsed.data;

  try {
    await connectDB();
    const current = await SiteContent.findOne({ key: "main" }).lean();

    if (!data.seo.ogImage) data.seo.ogImage = "/og-image.jpg";
    await SiteContent.findOneAndUpdate({ key: "main" }, { $set: { key: "main", ...data } }, { upsert: true });
    await deleteIfUnused([current?.seo?.ogImage ?? "", ...(current?.team ?? []).map((m) => m.photo ?? "")]);
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
  revalidateSite();
  return { ok: true, message: "Saved — the public site is updated." };
}
