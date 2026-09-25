import mongoose, { Schema, type Model } from "mongoose";

// Explicit document types. Mongoose 9 InferSchemaType on these schemas made the
// TypeScript checker run out of memory (next build was killed with SIGKILL).
type Seo = { title?: string; description?: string };
type Timestamps = { createdAt?: Date; updatedAt?: Date };

export interface ProjectDoc extends Timestamps {
  title: string; slug: string; subtitle: string; location: string; category: string; year: string;
  summary: string; content: string; coverImage: string; gallery: string[]; videos: string[];
  /** Up to six gallery images shown on the page; the rest sit behind "View all". */
  highlights: string[];
  featured: boolean; published: boolean; order: number; seo: Seo;
  /** Published projects stay hidden until this moment (null = immediately). */
  publishAt: Date | null;
  /** Secret for the /api/preview link that shows the page before it is public. */
  previewToken: string;
}
export interface ServiceDoc extends Timestamps {
  title: string; slug: string; icon: string; image: string; summary: string; content: string;
  features: string[]; order: number; published: boolean; seo: Seo;
}
export interface MessageDoc extends Timestamps {
  name: string; email: string; phone: string; subject: string; body: string; read: boolean;
  /** Sales pipeline stage; see ENQUIRY_STATUSES in lib/enquiries.ts. */
  status: string;
  tags: string[];
  notes: { text: string; at: Date }[];
  /** Salted hash of the sender's IP, for rate limiting. Never the IP itself. */
  ipHash: string;
}
export interface SiteContentDoc extends Timestamps {
  key: string; brandName?: string; tagline?: string;
  heroStages: { eyebrow?: string; title?: string; text?: string }[];
  aboutTitle?: string; aboutText?: string; portfolioIntro?: string; showreel?: string;
  team: { name?: string; role?: string; bio?: string; photo?: string }[];
  stats: { value?: string; label?: string }[];
  process: { title?: string; text?: string }[];
  contact?: { email?: string; phone?: string; address?: string };
  socials?: { instagram?: string; linkedin?: string; youtube?: string };
  seo?: { title?: string; description?: string; keywords?: string; ogImage?: string };
}
export interface MediaDoc extends Timestamps {
  url: string; name: string; contentType: string; size: number; width: number; height: number; alt: string;
}
export interface UserDoc extends Timestamps {
  email: string; name: string; passwordHash: string; role: string;
}

const seoSchema = new Schema<Seo>(
  { title: { type: String, default: "" }, description: { type: String, default: "" } },
  { _id: false },
);

const projectSchema = new Schema<ProjectDoc>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    subtitle: { type: String, default: "" },
    location: { type: String, default: "" },
    category: { type: String, default: "" },
    year: { type: String, default: "" },
    summary: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    seo: { type: seoSchema, default: () => ({}) },
    publishAt: { type: Date, default: null },
    previewToken: { type: String, default: "" },
  },
  { timestamps: true },
);

const serviceSchema = new Schema<ServiceDoc>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    icon: { type: String, default: "" },
    image: { type: String, default: "" },
    summary: { type: String, default: "" },
    content: { type: String, default: "" },
    features: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

const messageSchema = new Schema<MessageDoc>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
    status: { type: String, default: "new", index: true },
    tags: { type: [String], default: [] },
    notes: { type: [{ text: String, at: Date, _id: false }], default: [] },
    ipHash: { type: String, default: "", index: true },
  },
  { timestamps: true },
);

const stageSchema = new Schema<SiteContentDoc["heroStages"][number]>(
  { eyebrow: String, title: String, text: String },
  { _id: false },
);

const siteContentSchema = new Schema<SiteContentDoc>(
  {
    key: { type: String, default: "main", unique: true },
    brandName: String,
    tagline: String,
    heroStages: { type: [stageSchema], default: [] },
    aboutTitle: String,
    aboutText: String,
    portfolioIntro: String,
    showreel: String,
    team: { type: [{ name: String, role: String, bio: String, photo: String, _id: false }], default: [] },
    stats: { type: [{ value: String, label: String, _id: false }], default: [] },
    process: { type: [{ title: String, text: String, _id: false }], default: [] },
    contact: {
      email: String,
      phone: String,
      address: String,
      _id: false,
    },
    socials: {
      instagram: String,
      linkedin: String,
      youtube: String,
      _id: false,
    },
    seo: {
      title: String,
      description: String,
      keywords: String,
      ogImage: String,
      _id: false,
    },
  },
  { timestamps: true },
);

// One record per image, keyed by URL. Projects, services and site content keep
// plain URL strings; this collection only adds metadata (alt text, size), so
// images shipped with the site get a record the first time their alt is edited.
const mediaSchema = new Schema<MediaDoc>(
  {
    url: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    contentType: { type: String, default: "" },
    size: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    alt: { type: String, default: "" },
  },
  { timestamps: true },
);

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, default: "Admin" },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true },
);


// Note: do not cast Schema<T> to Schema (or pass it through a generic helper typed
// as Schema) - that structural comparison exhausts the TypeScript checker.
const models = mongoose.models as unknown as Record<string, unknown>;

export const Project = (models.Project as unknown as Model<ProjectDoc> | undefined) ?? mongoose.model<ProjectDoc>("Project", projectSchema);
export const Service = (models.Service as unknown as Model<ServiceDoc> | undefined) ?? mongoose.model<ServiceDoc>("Service", serviceSchema);
export const Message = (models.Message as unknown as Model<MessageDoc> | undefined) ?? mongoose.model<MessageDoc>("Message", messageSchema);
export const SiteContent = (models.SiteContent as unknown as Model<SiteContentDoc> | undefined) ?? mongoose.model<SiteContentDoc>("SiteContent", siteContentSchema);
export const User = (models.User as unknown as Model<UserDoc> | undefined) ?? mongoose.model<UserDoc>("User", userSchema);
export const Media = (models.Media as unknown as Model<MediaDoc> | undefined) ?? mongoose.model<MediaDoc>("Media", mediaSchema);
