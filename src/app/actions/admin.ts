"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { requireAdmin } from "@/auth";
import { connectDB } from "@/lib/db";
import { STAGE_COUNT } from "@/lib/sequence";
import { deleteUpload, saveUpload, saveUploads } from "@/lib/storage";
import { projectSchema, serviceSchema, type FormState } from "@/lib/validators";
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

    let coverImage = existing?.coverImage ?? "";
    const cover = await saveUpload(fd.get("coverFile") as File | null);
    if (cover) {
      if (coverImage) await deleteUpload(coverImage);
      coverImage = cover;
    }

    const keep = fd.getAll("keepGallery").map(String);
    const removed = (existing?.gallery ?? []).filter((g) => !keep.includes(g));
    await Promise.all(removed.map(deleteUpload));
    const added = await saveUploads(fd.getAll("galleryFiles") as File[]);
    const gallery = [...keep, ...added];

    const payload = { ...data, coverImage, gallery, seo: { title: seoTitle, description: seoDescription } };
    if (existing) {
      existing.set(payload);
      await existing.save();
    } else {
      await Project.create(payload);
    }
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
  if (doc) await Promise.all([doc.coverImage, ...doc.gallery].filter(Boolean).map((u) => deleteUpload(u)));
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
    summary: text(fd, "summary"),
    content: text(fd, "content"),
    order: text(fd, "order") || 0,
    published: bool(fd, "published"),
    seoTitle: text(fd, "seoTitle"),
    seoDescription: text(fd, "seoDescription"),
  });
  if (!parsed.success) return { ok: false, message: "Please fix the errors below.", errors: parsed.error.flatten().fieldErrors };

  const { seoTitle, seoDescription, ...data } = parsed.data;
  const payload: Record<string, unknown> = { ...data, seo: { title: seoTitle, description: seoDescription } };
  try {
    await connectDB();
    const image = await saveUpload(fd.get("imageFile") as File | null);
    if (image) {
      const prev = id ? await Service.findById(id).lean() : null;
      if (prev?.image) await deleteUpload(prev.image);
      payload.image = image;
    }
    if (id) {
      const res = await Service.findByIdAndUpdate(id, payload, { runValidators: true });
      if (!res) return { ok: false, message: "Service not found." };
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
  await Service.findByIdAndDelete(id);
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

export async function saveSiteContent(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const rows = <T extends string>(prefix: string, keys: T[]) => {
    const cols = keys.map((k) => fd.getAll(`${prefix}.${k}`).map(String));
    return cols[0].map((_, i) => Object.fromEntries(keys.map((k, j) => [k, cols[j][i]?.trim() ?? ""])) as Record<T, string>)
      .filter((r) => Object.values(r).some(Boolean));
  };

  const heroStages = rows("stage", ["eyebrow", "title", "text"]);
  if (!heroStages.length) return { ok: false, message: "At least one scroll stage is required." };

  try {
    await connectDB();
    const current = await SiteContent.findOne({ key: "main" }).lean();
    let ogImage = text(fd, "seo.ogImage") || current?.seo?.ogImage || "/og-image.jpg";
    const uploaded = await saveUpload(fd.get("ogFile") as File | null);
    if (uploaded) {
      if (current?.seo?.ogImage) await deleteUpload(current.seo.ogImage);
      ogImage = uploaded;
    }

    await SiteContent.findOneAndUpdate(
      { key: "main" },
      {
        key: "main",
        brandName: text(fd, "brandName").trim(),
        tagline: text(fd, "tagline").trim(),
        heroStages: heroStages.slice(0, STAGE_COUNT),
        aboutTitle: text(fd, "aboutTitle").trim(),
        aboutText: text(fd, "aboutText").trim(),
        stats: rows("stat", ["value", "label"]),
        process: rows("process", ["title", "text"]),
        contact: { email: text(fd, "contact.email"), phone: text(fd, "contact.phone"), address: text(fd, "contact.address") },
        socials: { instagram: text(fd, "socials.instagram"), linkedin: text(fd, "socials.linkedin"), youtube: text(fd, "socials.youtube") },
        seo: { title: text(fd, "seo.title"), description: text(fd, "seo.description"), keywords: text(fd, "seo.keywords"), ogImage },
      },
      { upsert: true },
    );
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
  revalidateSite();
  return { ok: true, message: "Saved. The public site has been updated." };
}
