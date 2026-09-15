import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import ProjectGrid from "@/components/site/ProjectGrid";
import JsonLd from "@/components/site/JsonLd";
import { getProjects, getSiteContent, siteUrl } from "@/lib/data";

export const metadata: Metadata = {
  title: "Portfolio — Our latest projects",
  description:
    "Luxury villas, residences and apartments visualised and designed by our studio in London, the French Riviera, Monaco and the UAE.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const [projects, site] = await Promise.all([getProjects(), getSiteContent()]);
  const url = siteUrl();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Portfolio",
          itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${url}/projects/${p.slug}`, name: p.title })),
        }}
      />
      <PageHero eyebrow="Portfolio" title="Our latest projects" intro={site.portfolioIntro} />
      <ProjectGrid projects={projects} />
    </>
  );
}
