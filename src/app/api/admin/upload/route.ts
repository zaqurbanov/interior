import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveLocalUpload, uploadDriver } from "@/lib/storage";
import { IMAGE_TYPES, MAX_UPLOAD_BYTES, MAX_VIDEO_BYTES, VIDEO_TYPES } from "@/lib/upload-config";

// Admin uploads. The browser asks GET which driver is active, then either
//  - blob:  sends handleUpload's JSON handshake here, gets a one-off client
//           token, and uploads the file straight to Vercel Blob (the file never
//           passes through this function, so Vercel's 4.5 MB body limit does
//           not apply), or
//  - local: posts the file here as multipart form data (dev / own server).
// Not under /admin, so middleware does not guard it — every branch checks the
// session itself.

const unauthorized = () => NextResponse.json({ error: "Please sign in again." }, { status: 401 });

export async function GET() {
  if (!(await auth())?.user) return unauthorized();
  return NextResponse.json({ driver: uploadDriver() });
}

export async function POST(request: Request) {
  const type = request.headers.get("content-type") ?? "";

  if (type.startsWith("multipart/form-data")) {
    if (!(await auth())?.user) return unauthorized();
    if (uploadDriver() !== "local") return NextResponse.json({ error: "Direct uploads are disabled; use Blob." }, { status: 400 });
    try {
      const file = (await request.formData()).get("file");
      if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
      return NextResponse.json({ url: await saveLocalUpload(file) });
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const json = await handleUpload({
      body,
      request,
      // Runs before a token is issued — the only gate between the internet and the store.
      onBeforeGenerateToken: async (pathname) => {
        if (!(await auth())?.user) throw new Error("Please sign in again.");
        // Images go under uploads/, walkthrough source videos under videos/.
        if (pathname.startsWith("videos/")) {
          return { allowedContentTypes: [...VIDEO_TYPES], maximumSizeInBytes: MAX_VIDEO_BYTES, addRandomSuffix: true };
        }
        if (!pathname.startsWith("uploads/")) throw new Error("Invalid upload path.");
        return {
          allowedContentTypes: [...IMAGE_TYPES],
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
        };
      },
      // No onUploadCompleted: Vercel cannot reach localhost to call it, so the
      // browser registers the file in the media library itself after uploading.
    });
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
