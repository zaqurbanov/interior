import type { Metadata } from "next";
import Link from "next/link";
import ArticleCard from "@/components/site/ArticleCard";
import JsonLd from "@/components/site/JsonLd";
import PageHero from "@/components/site/PageHero";
import { articleDate, getArticles, getImageAlts, getSiteContent, siteUrl } from "@/lib/data";

export const metadata: Metadata = {
  title: "Journal — Interior design ideas and projects",
  description:
    "Notes from our London studio: interior design guides, materials and lighting, and the stories behind our villas and residences.",
  alternates: { canonical: "/journal", types: { "application/rss+xml": "/journal/rss.xml" } },
};

export default async function JournalPage() {
  const [articles, site, alts] = await Promise.all([getArticles(), getSiteContent(), getImageAlts()]);
  const url = siteUrl();
  const [first, ...rest] = articles;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${site.brandName} Journal`,
          url: `${url}/journal`,
          publisher: { "@type": "Organization", name: site.brandName, url },
          blogPost: articles.map((a) => ({
            "@type": "BlogPosting",
            headline: a.title,
            url: `${url}/journal/${a.slug}`,
            datePublished: articleDate(a),
          })),
        }}
      />
      <PageHero
        eyebrow="Journal"
        title="Notes from the studio"
        intro="Design ideas, materials and light, and the stories behind the homes we create — from London to the Riviera."
      />
      {first ? (
        <div className="container-x space-y-20 pb-28 md:space-y-28">
          <ArticleCard article={first} date={articleDate(first)} large alt={alts[first.coverImage]} />
          {rest.length > 0 && (
            <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => (
                <ArticleCard key={a.id} article={a} date={articleDate(a)} alt={alts[a.coverImage]} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="container-x pb-28">
          <p className="max-w-xl text-lg text-graphite">
            The first articles are on their way. Meanwhile, see our{" "}
            <Link href="/projects" className="text-ink underline decoration-bronze underline-offset-4">latest projects</Link>.
          </p>
        </div>
      )}
    </>
  );
}
