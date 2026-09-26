import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import PageViewTracker from "@/components/site/PageViewTracker";
import Reveal from "@/components/site/Reveal";
import PageTransition from "@/components/site/PageTransition";
import { getArticles, getSiteContent } from "@/lib/data";

export const revalidate = 3600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, latest] = await Promise.all([getSiteContent(), getArticles({ limit: 1 })]);
  // The journal joins the menu once it has its first article.
  const journal = latest.length > 0;
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">
        Skip to content
      </a>
      <PageTransition brandName={site.brandName} />
      <SmoothScroll />
      <PageViewTracker />
      <Reveal />
      <Header brandName={site.brandName} journal={journal} />
      <main id="main">{children}</main>
      <Footer site={site} journal={journal} />
    </>
  );
}
