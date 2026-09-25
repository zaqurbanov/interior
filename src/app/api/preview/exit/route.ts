import { cookies, draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { PREVIEW_COOKIE } from "@/lib/preview";

export async function GET(request: Request) {
  (await draftMode()).disable();
  (await cookies()).delete(PREVIEW_COOKIE);
  return NextResponse.redirect(new URL("/projects", request.url));
}
