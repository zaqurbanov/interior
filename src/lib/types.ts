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
  contact: { email: string; phone: string; address: string };
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
  featured: boolean;
  published: boolean;
  order: number;
  seo: Seo;
};

export type MessageData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
};
