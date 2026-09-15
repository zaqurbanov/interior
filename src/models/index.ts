import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const seoSchema = new Schema(
  { title: { type: String, default: "" }, description: { type: String, default: "" } },
  { _id: false },
);

const projectSchema = new Schema(
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
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

const serviceSchema = new Schema(
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

const messageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const stageSchema = new Schema(
  { eyebrow: String, title: String, text: String },
  { _id: false },
);

const siteContentSchema = new Schema(
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

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, default: "Admin" },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true },
);

export type ProjectDoc = InferSchemaType<typeof projectSchema>;
export type ServiceDoc = InferSchemaType<typeof serviceSchema>;
export type MessageDoc = InferSchemaType<typeof messageSchema>;
export type SiteContentDoc = InferSchemaType<typeof siteContentSchema>;
export type UserDoc = InferSchemaType<typeof userSchema>;

function model<T>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T>) ?? mongoose.model<T>(name, schema);
}

export const Project = model<ProjectDoc>("Project", projectSchema);
export const Service = model<ServiceDoc>("Service", serviceSchema);
export const Message = model<MessageDoc>("Message", messageSchema);
export const SiteContent = model<SiteContentDoc>("SiteContent", siteContentSchema);
export const User = model<UserDoc>("User", userSchema);
