import { NextResponse } from "next/server";
import { cookies, draftMode } from "next/headers";
import { connectDB, isDbConfigured } from "@/lib/db";
import { PREVIEW_COOKIE } from "@/lib/preview";
import { PageView } from "@/models";

// Page-view counter for the admin dashboard. Stores only "path, day, count":
// no cookies, no IP, nothing about the visitor. Called by PageViewTracker.

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|lighthouse|headless|curl|wget/i;
const PATH = /^\/[a-z0-9/-]{0,200}$/;

export async function POST(request: Request) {
  if (!isDbConfigured() || BOT.test(request.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });
  // Draft previews are the studio looking at its own work.
  if ((await draftMode()).isEnabled || (await cookies()).has(PREVIEW_COOKIE)) return new NextResponse(null, { status: 204 });

  let path = "";
  try {
    path = String((await request.json()).path ?? "");
  } catch {}
  path = path.replace(/\/+$/, "") || "/";
  if (!PATH.test(path) || path.startsWith("/admin") || path.startsWith("/api")) return new NextResponse(null, { status: 204 });

  try {
    await connectDB();
    const day = new Date().toISOString().slice(0, 10);
    await PageView.updateOne({ day, path }, { $inc: { count: 1 } }, { upsert: true });
  } catch (err) {
    console.error("[track]", (err as Error).message);
  }
  return new NextResponse(null, { status: 204 });
}
