import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/site/ArticleCard";
import JsonLd from "@/components/site/JsonLd";
import ProjectCard from "@/components/site/ProjectCard";
import { articleDate, getArticle, getArticles, getImageAlts, getProjects, getSiteContent, siteUrl } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import { metaDescription } from "@/lib/meta";
import { articleHtml, readingMinutes } from "@/lib/rich-text";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

const describe = (a: { seo: { description?: string }; excerpt: string; content: string }) =>
  a.seo.description || metaDescription(a.excerpt || a.content.replace(/<[^>]+>/g, " "));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  const title = article.seo.title || article.title;
  const description = describe(article);
  return {
    title,
    description,
    alternates: { canonical: `/journal/${article.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: articleDate(article),
      modifiedTime: article.updatedAt || undefined,
      authors: article.author ? [article.author] : undefined,
      section: article.category || undefined,
      tags: article.tags,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [article, site, alts, projects, recent] = await Promise.all([
    getArticle(slug),
    getSiteContent(),
    getImageAlts(),
    getProjects(),
    getArticles({ limit: 4 }),
  ]);
  if (!article) notFound();

  const url = siteUrl();
  const abs = (u: string) => (/^https?:\/\//.test(u) ? u : `${url}${u}`);
  const date = articleDate(article);
  const { html, headings } = articleHtml(article.content);
  const minutes = readingMinutes(article.content);
  const author = article.author || site.brandName;
  const related = article.projects.map((s) => projects.find((p) => p.slug === s)).filter((p) => p !== undefined);
  const more = recent.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              headline: article.title,
              description: describe(article),
              image: article.coverImage ? [abs(article.coverImage)] : undefined,
              datePublished: date,
              dateModified: article.updatedAt || date,
              author: article.author ? { "@type": "Person", name: article.author } : { "@type": "Organization", name: site.brandName, url },
              publisher: { "@type": "Organization", name: site.brandName, url, logo: { "@type": "ImageObject", url: `${url}/icon.svg` } },
              mainEntityOfPage: `${url}/journal/${article.slug}`,
              articleSection: article.category || undefined,
              keywords: article.tags.length ? article.tags.join(", ") : undefined,
              wordCount: article.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length,
              about: related.map((p) => ({ "@type": "CreativeWork", name: p.title, url: `${url}/projects/${p.slug}` })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: url },
                { "@type": "ListItem", position: 2, name: "Journal", item: `${url}/journal` },
                { "@type": "ListItem", position: 3, name: article.title, item: `${url}/journal/${article.slug}` },
              ],
            },
          ],
        }}
      />

      <header className="container-x pb-12 pt-36 md:pb-16 md:pt-48">
        <nav aria-label="Breadcrumb" className="eyebrow text-[0.62rem] text-graphite">
          <Link href="/journal" className="hover:text-ink">Journal</Link>
          {article.category && <span className="text-bronze"> · {article.category}</span>}
        </nav>
        <h1 className="mt-5 max-w-5xl font-serif text-[clamp(2.4rem,6vw,5.5rem)] font-light leading-[0.98] text-ink">{article.title}</h1>
        {article.excerpt && <p className="mt-8 max-w-2xl text-lg leading-relaxed text-graphite">{article.excerpt}</p>}
        <p className="mt-8 text-sm text-graphite">
          <time dateTime={date}>{formatDate(date)}</time> · {minutes} min read · {author}
        </p>
      </header>

      {article.coverImage && (
        <div className="relative mx-auto mb-16 aspect-[16/9] w-full max-w-[1600px] overflow-hidden bg-sand md:mb-24 md:aspect-[21/9]">
          <Image src={article.coverImage} alt={alts[article.coverImage] || article.title} fill priority sizes="100vw" className="object-cover" />
        </div>
      )}

      <div className="container-x grid gap-12 pb-24 md:grid-cols-12">
        {headings.length >= 2 && (
          <aside className="md:col-span-3">
            <nav aria-label="In this article" className="md:sticky md:top-28">
              <p className="eyebrow text-[0.62rem] text-graphite">In this article</p>
              <ol className="mt-4 space-y-2.5 border-l border-ink/10 pl-4 text-sm">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-graphite transition hover:text-ink">{h.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}
        <article className={headings.length >= 2 ? "md:col-span-8 md:col-start-5" : "md:col-span-8 md:col-start-3"}>
          <div className="rich-text text-lg leading-relaxed text-graphite" dangerouslySetInnerHTML={{ __html: html }} />
          {article.tags.length > 0 && (
            <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
              {article.tags.map((t) => (
                <li key={t} className="rounded-full border border-ink/15 px-3 py-1 text-xs text-graphite">{t}</li>
              ))}
            </ul>
          )}
          <div className="mt-14 border-t border-ink/10 pt-10">
            <p className="font-serif text-3xl text-ink">Planning something similar?</p>
            <p className="mt-3 max-w-xl text-graphite">Tell us about your space — we reply within one or two working days.</p>
            <Link href="/contact" className="mt-6 inline-block rounded-full bg-ink px-8 py-4 text-sm text-ivory transition hover:bg-bronze">
              Start your project
            </Link>
          </div>
        </article>
      </div>

      {related.length > 0 && (
        <section className="border-t border-ink/10" aria-labelledby="related-projects">
          <div className="container-x py-20">
            <h2 id="related-projects" className="eyebrow text-[0.62rem] text-graphite">Projects in this article</h2>
            <div className="mt-10 grid gap-x-10 gap-y-16 md:grid-cols-2">
              {related.map((p, i) => (
                <ProjectCard key={p.slug} project={p} index={i} alt={alts[p.coverImage]} />
              ))}
            </div>
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="border-t border-ink/10" aria-labelledby="more-articles">
          <div className="container-x py-20">
            <div className="flex items-baseline justify-between gap-6">
              <h2 id="more-articles" className="eyebrow text-[0.62rem] text-graphite">More from the journal</h2>
              <Link href="/journal" className="text-sm text-ink underline decoration-bronze underline-offset-4">All articles</Link>
            </div>
            <div className="mt-10 grid gap-x-10 gap-y-16 md:grid-cols-3">
              {more.map((a) => (
                <ArticleCard key={a.id} article={a} date={articleDate(a)} alt={alts[a.coverImage]} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
