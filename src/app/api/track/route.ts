import { NextResponse } from "next/server";
import { cookies, draftMode } from "next/headers";
import { connectDB, isDbConfigured } from "@/lib/db";
import { PREVIEW_COOKIE } from "@/lib/preview";
import { PageView, Project, Service } from "@/models";

// Page-view counter for the admin dashboard. Stores only "path, day, count":
// no cookies, no IP, nothing about the visitor. Called by PageViewTracker.

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|lighthouse|headless|curl|wget/i;
const PAGES = new Set(["/", "/about", "/contact", "/projects"]);
const DETAIL = /^\/(projects|services)\/([a-z0-9-]{1,120})$/;

/** Only the site's real pages are counted, so the table cannot be filled with made-up paths. */
async function isSitePage(path: string) {
  if (PAGES.has(path)) return true;
  const m = DETAIL.exec(path);
  if (!m) return false;
  const found = m[1] === "projects" ? await Project.exists({ slug: m[2] }) : await Service.exists({ slug: m[2] });
  return Boolean(found);
}

export async function POST(request: Request) {
  if (!isDbConfigured() || BOT.test(request.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });
  // Draft previews are the studio looking at its own work.
  if ((await draftMode()).isEnabled || (await cookies()).has(PREVIEW_COOKIE)) return new NextResponse(null, { status: 204 });

  let path = "";
  try {
    path = String((await request.json()).path ?? "");
  } catch {}
  path = path.replace(/\/+$/, "") || "/";

  try {
    await connectDB();
    if (!(await isSitePage(path))) return new NextResponse(null, { status: 204 });
    const day = new Date().toISOString().slice(0, 10);
    await PageView.updateOne({ day, path }, { $inc: { count: 1 } }, { upsert: true });
  } catch (err) {
    console.error("[track]", (err as Error).message);
  }
  return new NextResponse(null, { status: 204 });
}
