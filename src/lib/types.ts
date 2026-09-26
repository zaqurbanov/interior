export type Seo = { title?: string; description?: string };

export type Stage = { eyebrow: string; title: string; text: string };

export type TeamMember = { name: string; role: string; bio: string; photo: string };

export type SiteContentData = {
  brandName: string;
  tagline: string;
  heroStages: Stage[];
  aboutTitle: string;
  aboutText: string;
  portfolioIntro: string;
  /** "youtube:ID" or "vimeo:ID" */
  showreel: string;
  team: TeamMember[];
  stats: { value: string; label: string }[];
  process: { title: string; text: string }[];
  /** whatsapp: number in international format, "" = no WhatsApp button. */
  contact: { email: string; phone: string; address: string; whatsapp: string };
  socials: { instagram: string; linkedin: string; youtube: string };
  seo: { title: string; description: string; keywords: string; ogImage: string };
};

export type ServiceData = {
  id: string;
  title: string;
  slug: string;
  icon: string;
  image: string;
  summary: string;
  content: string;
  features: string[];
  order: number;
  published: boolean;
  seo: Seo;
};

export type ProjectData = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  location: string;
  category: string;
  year: string;
  summary: string;
  content: string;
  coverImage: string;
  gallery: string[];
  /** "youtube:ID" or "vimeo:ID" */
  videos: string[];
  /** Gallery images chosen for the page (max 6); empty = the first six. */
  highlights: string[];
  /** Service slugs; empty = matched to services by category. */
  services: string[];
  featured: boolean;
  published: boolean;
  order: number;
  seo: Seo;
  /** ISO date; empty = publish immediately. */
  publishAt: string;
  /** ISO; empty for the built-in fallback content. */
  createdAt: string;
  previewToken: string;
};

export type ArticleData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /** Sanitised HTML (may contain images). */
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  /** Project slugs. */
  projects: string[];
  published: boolean;
  /** ISO; empty = publish on save. */
  publishAt: string;
  seo: Seo;
  /** ISO. The public date is publishAt, else createdAt. */
  createdAt: string;
  updatedAt: string;
};

export type MessageData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
  read: boolean;
  status: EnquiryStatus;
  tags: string[];
  notes: { text: string; at: string }[];
  createdAt: string;
};

export type EnquiryStatus = "new" | "replied" | "proposal" | "won" | "lost" | "spam";

export type MediaUsage = { label: string; href: string };

export type MediaItem = {
  url: string;
  name: string;
  alt: string;
  size: number;
  width: number;
  height: number;
  createdAt: string | null;
  usedBy: MediaUsage[];
  /** Uploaded through the admin (Blob or public/uploads), so it can be deleted. */
  stored: boolean;
};

/** A walkthrough as the admin editor sees it (Story model). */
export type StoryAdminData = {
  id: string;
  slug: string;
  version: number;
  base: string;
  fps: number;
  hold: number;
  scenes: number[];
  sources: { url: string; start: number; duration: number }[];
  extractFps: number;
  scrollVh: number;
  pauses: { at: number; units: number }[];
  stages: { at: number; eyebrow: string; title: string; text: string; label: string; facts: string[] }[];
  enabled: boolean;
  /** ISO, empty for frames copied from a built-in walkthrough. */
  framesAt: string;
  job: { status: "idle" | "processing" | "failed"; version: number; error: string; startedAt: string };
};
