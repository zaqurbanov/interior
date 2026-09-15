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

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type FormState = { ok: boolean; message: string; errors?: Record<string, string[] | undefined> };
