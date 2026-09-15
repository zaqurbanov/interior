import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { getSiteContent, siteUrl } from "@/lib/data";
import "./globals.css";

// Same typefaces as vladimir-fasij.com: Chillax (display & navigation) + Inter (text).
const chillax = localFont({
  src: [
    { path: "../fonts/Chillax-Extralight.woff2", weight: "200" },
    { path: "../fonts/Chillax-Light.woff2", weight: "300" },
    { path: "../fonts/Chillax-Regular.woff2", weight: "400" },
    { path: "../fonts/Chillax-Medium.woff2", weight: "500" },
    { path: "../fonts/Chillax-Semibold.woff2", weight: "600" },
    { path: "../fonts/Chillax-Bold.woff2", weight: "700" },
  ],
  variable: "--font-chillax",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: site.seo.title, template: `%s | ${site.brandName.replace(/\s*-\s*/, " ")}` },
    description: site.seo.description,
    keywords: site.seo.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    applicationName: site.brandName,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: site.brandName,
      title: site.seo.title,
      description: site.seo.description,
      url: "/",
      locale: "en_GB",
      images: [{ url: site.seo.ogImage, width: 1200, height: 630, alt: site.brandName }],
    },
    twitter: {
      card: "summary_large_image",
      title: site.seo.title,
      description: site.seo.description,
      images: [site.seo.ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${chillax.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
