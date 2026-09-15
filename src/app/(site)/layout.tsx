import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Reveal from "@/components/site/Reveal";
import { getSiteContent } from "@/lib/data";

export const revalidate = 3600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteContent();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">
        Skip to content
      </a>
      <SmoothScroll />
      <Reveal />
      <Header brandName={site.brandName} />
      <main id="main">{children}</main>
      <Footer site={site} />
    </>
  );
}
