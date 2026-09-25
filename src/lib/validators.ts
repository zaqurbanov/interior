import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.email("Please enter a valid email").max(200),
  phone: z.string().trim().max(40).optional().default(""),
  subject: z.string().trim().max(200).optional().default(""),
  body: z.string().trim().min(10, "Tell us a little more about your project").max(5000),
  company: z.string().optional(), // honeypot: real users leave it empty
});

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

const seo = { seoTitle: z.string().trim().max(120).default(""), seoDescription: z.string().trim().max(320).default("") };

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  slug,
  subtitle: z.string().trim().max(200).default(""),
  videos: z.array(z.string().regex(/^(youtube|vimeo):[\w-]+$/, "Use youtube:ID or vimeo:ID")).default([]),
  location: z.string().trim().max(160).default(""),
  category: z.string().trim().max(160).default(""),
  year: z.string().trim().max(20).default(""),
  summary: z.string().trim().max(600).default(""),
  content: z.string().trim().max(20000).default(""),
  order: z.coerce.number().int().default(0),
  featured: z.boolean(),
  published: z.boolean(),
  ...seo,
});

export const serviceSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  slug,
  icon: z.string().trim().max(40).default(""),
  features: z.array(z.string().trim().min(1).max(200)).default([]),
  summary: z.string().trim().max(600).default(""),
  content: z.string().trim().max(20000).default(""),
  order: z.coerce.number().int().default(0),
  published: z.boolean(),
  ...seo,
});

const optionalUrl = z.union([z.literal(""), z.url("Enter a full URL, starting with https://")]);

/** Site content & SEO (admin → Site content). Field paths match the form names. */
export const siteContentSchema = z.object({
  brandName: z.string().trim().min(1, "Brand name is required").max(80),
  tagline: z.string().trim().max(160),
  heroStages: z
    .array(
      z.object({
        eyebrow: z.string().trim().max(80),
        title: z.string().trim().min(1, "Every stage needs a title").max(140),
        text: z.string().trim().max(400),
      }),
    )
    .min(1),
  aboutTitle: z.string().trim().max(200),
  aboutText: z.string().trim().max(3000),
  portfolioIntro: z.string().trim().max(1500),
  showreel: z
    .string()
    .trim()
    .regex(/^((youtube|vimeo):[\w-]+)?$/, "Use youtube:VIDEO_ID or vimeo:VIDEO_ID"),
  stats: z.array(z.object({ value: z.string().trim().min(1).max(20), label: z.string().trim().max(60) })).max(8),
  process: z.array(z.object({ title: z.string().trim().min(1).max(80), text: z.string().trim().max(300) })).max(8),
  team: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Name is required").max(80),
        role: z.string().trim().max(80),
        bio: z.string().trim().max(800),
        photo: z.string().trim().max(500),
      }),
    )
    .max(20),
  contact: z.object({
    email: z.email("Enter a valid email"),
    phone: z.string().trim().max(40),
    address: z.string().trim().max(200),
  }),
  socials: z.object({ instagram: optionalUrl, linkedin: optionalUrl, youtube: optionalUrl }),
  seo: z.object({
    // Hard limits only stop the absurd; the form's counters show the recommended
    // lengths (60 / 160) without blocking a save.
    title: z.string().trim().min(1, "The page title is required").max(120, "Keep the title under 120 characters"),
    description: z.string().trim().min(1, "Add a description").max(320, "Keep the description under 320 characters"),
    keywords: z.string().trim().max(300),
    ogImage: z.string().trim().max(500),
  }),
});

export type SiteContentInput = z.infer<typeof siteContentSchema>;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type FormState = { ok: boolean; message: string; errors?: Record<string, string[] | undefined> };
