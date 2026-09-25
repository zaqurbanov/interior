"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { requireAdmin } from "@/auth";
import { connectDB } from "@/lib/db";
import { STAGE_COUNT } from "@/lib/sequence";
import { deleteUpload, saveUpload, saveUploads } from "@/lib/storage";
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

  // Team rows keep their index so each photo upload lines up with its member.
  const teamRows = rows("team", ["name", "role", "bio", "photo"]);
  const teamFiles = fd.getAll("team.photoFile") as File[];

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
    team: teamRows.filter((r) => r.name || r.role || r.bio),
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

    // Social-sharing image.
    const og = await saveUpload(fd.get("ogFile") as File | null);
    if (og) {
      if (current?.seo?.ogImage) await deleteUpload(current.seo.ogImage);
      data.seo.ogImage = og;
    }
    if (!data.seo.ogImage) data.seo.ogImage = "/og-image.jpg";

    // Team photos: a new file replaces that member's photo.
    let t = 0;
    for (let i = 0; i < teamRows.length; i++) {
      const row = teamRows[i];
      if (!(row.name || row.role || row.bio)) continue;
      const uploaded = await saveUpload(teamFiles[i] ?? null);
      if (uploaded) {
        if (data.team[t].photo) await deleteUpload(data.team[t].photo);
        data.team[t].photo = uploaded;
      }
      t++;
    }

    await SiteContent.findOneAndUpdate({ key: "main" }, { $set: { key: "main", ...data } }, { upsert: true });
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
  revalidateSite();
  return { ok: true, message: "Saved — the public site is updated." };
}
