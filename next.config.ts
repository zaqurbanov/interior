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
  // The old Webflow site (same domain until 2026-09-26) used /portfolio and
  // /portfoliocard/<slug>, and three slugs changed. Permanent redirects keep
  // Google rankings and old links working.
  async redirects() {
    return [
      { source: "/portfolio", destination: "/projects", permanent: true },
      { source: "/portfoliocard/villa-at-saadyat-island", destination: "/projects/villa-at-saadiyat-island", permanent: true },
      { source: "/portfoliocard/cap-martin", destination: "/projects/villa-luna-cap-martin", permanent: true },
      { source: "/portfoliocard/nudra-uae", destination: "/projects/villa-nudra", permanent: true },
      { source: "/portfoliocard/:slug", destination: "/projects/:slug", permanent: true },
      { source: "/portfoliocard", destination: "/projects", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Every page: never framed by another site (clickjacking), no MIME
        // sniffing, no full URLs leaked to other sites, no device APIs.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
        ],
      },
      {
        source: "/frames/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
