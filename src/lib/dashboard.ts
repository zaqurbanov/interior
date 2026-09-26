import "server-only";
import { siteUrl } from "./data";
import { listLibrary } from "./media";
import { mailConfigured } from "./mail";
import { Article, Message, PageView, Project, Service } from "@/models";

// Numbers for the admin dashboard. Days are UTC calendar days.

export type DayValue = { day: string; value: number };

const DAYS = 30;

function lastDays(n = DAYS) {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (n - 1 - i)));
    return d.toISOString().slice(0, 10);
  });
}

const fill = (days: string[], rows: { _id: string; n: number }[]): DayValue[] =>
  days.map((day) => ({ day, value: rows.find((r) => r._id === day)?.n ?? 0 }));

export async function enquiriesPerDay(): Promise<DayValue[]> {
  const days = lastDays();
  const rows = await Message.aggregate<{ _id: string; n: number }>([
    { $match: { createdAt: { $gte: new Date(`${days[0]}T00:00:00Z`) }, status: { $ne: "spam" } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, n: { $sum: 1 } } },
  ]);
  return fill(days, rows);
}

export async function viewsPerDay(): Promise<DayValue[]> {
  const days = lastDays();
  const rows = await PageView.aggregate<{ _id: string; n: number }>([
    { $match: { day: { $gte: days[0] } } },
    { $group: { _id: "$day", n: { $sum: "$count" } } },
  ]);
  return fill(days, rows);
}

export async function topProjects(limit = 6): Promise<{ title: string; href: string; views: number }[]> {
  const since = lastDays()[0];
  const rows = await PageView.aggregate<{ _id: string; n: number }>([
    { $match: { day: { $gte: since }, path: { $regex: "^/projects/[^/]+$" } } },
    { $group: { _id: "$path", n: { $sum: "$count" } } },
    { $sort: { n: -1 } },
    { $limit: limit },
  ]);
  const slugs = rows.map((r) => r._id.split("/").pop()!);
  const projects = await Project.find({ slug: { $in: slugs } }, { title: 1, slug: 1 }).lean();
  return rows.map((r) => {
    const slug = r._id.split("/").pop()!;
    const p = projects.find((x) => x.slug === slug);
    return { title: p?.title ?? slug, href: p ? `/admin/projects/${p._id}` : r._id, views: r.n };
  });
}

export type Attention = { tone: "warning" | "info"; text: string; href: string; items?: string[] };

/** Things worth doing next, most urgent first. */
export async function needsAttention(): Promise<Attention[]> {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const [unread, waiting, projects, servicesNoImage, library, articles] = await Promise.all([
    Message.countDocuments({ read: false, status: { $ne: "spam" } }),
    Message.countDocuments({ status: "new", createdAt: { $lt: twoDaysAgo } }),
    Project.find({}, { title: 1, coverImage: 1, summary: 1, gallery: 1, published: 1, publishAt: 1, seo: 1 }).lean(),
    Service.find({ published: true, $or: [{ image: "" }, { image: { $exists: false } }] }, { title: 1 }).lean(),
    listLibrary(),
    Article.find({}, { title: 1, excerpt: 1, coverImage: 1, published: 1, publishAt: 1, createdAt: 1, seo: 1 }).lean(),
  ]);
  const out: Attention[] = [];
  const names = (list: { title: string }[]) => list.map((p) => p.title);

  if (waiting) out.push({ tone: "warning", text: `${waiting} ${waiting === 1 ? "enquiry has" : "enquiries have"} waited over two days without a reply`, href: "/admin/messages?status=new" });
  if (unread) out.push({ tone: "warning", text: `${unread} unread ${unread === 1 ? "enquiry" : "enquiries"}`, href: "/admin/messages" });


  const live = projects.filter((p) => p.published);
  const noCover = live.filter((p) => !p.coverImage);
  if (noCover.length) out.push({ tone: "warning", text: "Published projects without a cover image", href: "/admin/projects", items: names(noCover) });
  const noSummary = live.filter((p) => !p.summary && !p.seo?.description);
  if (noSummary.length) out.push({ tone: "info", text: "Projects without a summary (Google shows it under the title)", href: "/admin/projects", items: names(noSummary) });
  const thin = live.filter((p) => (p.gallery?.length ?? 0) < 3);
  if (thin.length) out.push({ tone: "info", text: "Published projects with fewer than three gallery images", href: "/admin/projects", items: names(thin) });
  if (servicesNoImage.length) out.push({ tone: "info", text: "Published services without an image", href: "/admin/services", items: names(servicesNoImage) });

  const liveArticles = articles.filter((a) => a.published);
  if (!articles.length) {
    out.push({ tone: "info", text: "No journal articles yet — regular articles are one of the best ways to be found on Google", href: "/admin/articles/new" });
  } else {
    const thinArticles = liveArticles.filter((a) => !a.coverImage || (!a.excerpt && !a.seo?.description));
    if (thinArticles.length) out.push({ tone: "info", text: "Published articles without a cover image or excerpt", href: "/admin/articles", items: names(thinArticles) });
    const newest = Math.max(0, ...liveArticles.map((a) => new Date(a.publishAt ?? a.createdAt ?? 0).getTime()));
    if (liveArticles.length && Date.now() - newest > 45 * 24 * 60 * 60 * 1000) {
      out.push({ tone: "info", text: "No new journal article for over six weeks — Google favours sites that keep publishing", href: "/admin/articles/new" });
    }
  }

  const noAlt = library.filter((m) => !m.alt && m.usedBy.length).length;
  if (noAlt) out.push({ tone: "info", text: `${noAlt} images in use have no alt text (search engines and screen readers)`, href: "/admin/media?filter=no-alt" });

  const scheduled = projects.filter((p) => p.published && p.publishAt && new Date(p.publishAt) > new Date());
  if (scheduled.length) {
    out.push({
      tone: "info",
      text: "Scheduled to go live",
      href: "/admin/projects",
      items: scheduled.map((p) => `${p.title} — ${new Date(p.publishAt!).toISOString().slice(0, 16).replace("T", " ")} UTC`),
    });
  }

  // Setup that is still missing.
  if (siteUrl().includes("localhost")) out.push({ tone: "warning", text: "NEXT_PUBLIC_SITE_URL still points at localhost — links in emails, the sitemap and social previews are wrong", href: "/admin" });
  if (!mailConfigured()) out.push({ tone: "info", text: "Email is off: set RESEND_API_KEY to get enquiry alerts", href: "/admin/messages" });
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) out.push({ tone: "warning", text: "No Blob store connected — image uploads will fail", href: "/admin/media" });

  return out;
}
