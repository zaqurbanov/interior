import { cookies, draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PREVIEW_COOKIE } from "@/lib/preview";
import { Project } from "@/models";

// Shareable preview link for a project that is not public yet (draft or
// scheduled). Anyone with the link can see that one project.
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[\w-]{16,64}$/.test(token)) return new NextResponse("Invalid preview link.", { status: 404 });
  await connectDB();
  const project = await Project.findOne({ previewToken: token }, { slug: 1 }).lean();
  if (!project) return new NextResponse("This preview link is no longer valid.", { status: 404 });

  (await draftMode()).enable();
  (await cookies()).set(PREVIEW_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return NextResponse.redirect(new URL(`/projects/${project.slug}`, request.url));
}
