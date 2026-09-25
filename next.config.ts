import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static assets are served by the CDN; keep them out of the server function
  // bundles, which Vercel stores per deployment.
  outputFileTracingExcludes: {
    "*": ["public/frames/**", "public/images/**", "public/uploads/**", "videos/**"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Admin uploads are served from Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  async headers() {
    return [
      {
        source: "/frames/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
