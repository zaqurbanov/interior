import type { Metadata } from "next";
import SkeletonImage from "@/components/site/SkeletonImage";
import ProjectStory from "@/components/scroll/ProjectStory";
import Link from "next/link";
import { cookies, draftMode } from "next/headers";
import { notFound } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import ShowcaseGallery from "@/components/site/ShowcaseGallery";
import VideoEmbed from "@/components/site/VideoEmbed";
import { toHtml } from "@/lib/rich-text";
import { embedVideo, storyVideo } from "@/lib/video-schema";
import { articleDate, getArticles, getImageAlts, getProject, getProjectPreview, getProjects, getSiteContent, getStory, siteUrl } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import { PREVIEW_COOKIE } from "@/lib/preview";
import { metaDescription } from "@/lib/meta";
import ProjectEnquiry from "@/components/site/ProjectEnquiry";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

/**
 * The live project, or — in draft mode with a matching preview cookie — one
 * that is not public yet. cookies() is only read in draft mode, so normal
 * visits stay statically generated.
 */
async function loadProject(slug: string) {
  const live = await getProject(slug);
  if (live || !(await draftMode()).isEnabled) return { project: live, preview: false };
  const token = (await cookies()).get(PREVIEW_COOKIE)?.value ?? "";
  const draft = await getProjectPreview(slug, token);
  return { project: draft, preview: Boolean(draft) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { project, preview } = await loadProject(slug);
  if (!project) return {};
  const title = project.seo.title || `${project.title} — ${project.category || "Design"} in ${project.location}`;
  const description = project.seo.description || metaDescription(project.summary);
  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { type: "article", title, description, images: project.coverImage ? [project.coverImage] : undefined },
    ...(preview ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [{ project, preview }, all, site, alts] = await Promise.all([loadProject(slug), getProjects(), getSiteContent(), getImageAlts()]);
  if (!project) notFound();
  const [story, articles] = await Promise.all([getStory(project.slug), getArticles({ project: project.slug, limit: 3 })]);

  const idx = all.findIndex((p) => p.slug === project.slug);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null;
  const url = siteUrl();

  return (
    <article>
      {preview && (
        <div className="fixed inset-x-0 bottom-0 z-[70] flex items-center justify-center gap-4 bg-bronze px-4 py-2.5 text-sm text-white">
          <span>Preview — this project is not public yet.</span>
          <a href="/api/preview/exit" className="underline underline-offset-2">Exit preview</a>
        </div>
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CreativeWork",
              name: project.title,
              description: project.summary,
              // Uploads are absolute Blob URLs; files shipped with the site are paths.
              image: [project.coverImage, ...project.gallery].filter(Boolean).slice(0, 6).map((i) => (i.startsWith("http") ? i : `${url}${i}`)),
              locationCreated: { "@type": "Place", name: project.location },
              creator: { "@type": "Organization", name: site.brandName, url },
              url: `${url}/projects/${project.slug}`,
            },
            ...(story
              ? [
                  storyVideo(
                    story,
                    { name: `${project.title} — 3D walkthrough`, description: project.summary || project.subtitle || project.title, pageUrl: `${url}/projects/${project.slug}` },
                    { siteUrl: url },
                  ),
                ]
              : []),
            ...project.videos.map((v, i) =>
              embedVideo(
                v,
                {
                  name: `${project.title} — 3D animation${project.videos.length > 1 ? ` ${i + 1}` : ""}`,
                  description: project.summary || project.subtitle || project.title,
                  uploadDate: project.createdAt,
                  thumbnail: project.coverImage,
                  pageUrl: `${url}/projects/${project.slug}`,
                },
                { siteUrl: url },
              ),
            ),
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: url },
                { "@type": "ListItem", position: 2, name: "Projects", item: `${url}/projects` },
                { "@type": "ListItem", position: 3, name: project.title, item: `${url}/projects/${project.slug}` },
              ],
            },
          ].filter(Boolean),
        }}
      />

      <header className="container-x pb-12 pt-36 md:pt-48">
        <nav aria-label="Breadcrumb" className="eyebrow text-[0.62rem] text-graphite">
          <Link href="/projects" className="link-underline">Projects</Link> / {project.title}
        </nav>
        <h1 className="mt-6 font-serif text-[clamp(3rem,8vw,7.5rem)] font-light leading-[0.92] text-ink">{project.title}</h1>
        <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-6 border-t border-ink/10 pt-6 text-sm md:grid-cols-3">
          <div><dt className="eyebrow text-[0.6rem] text-graphite">Location</dt><dd className="mt-1">{project.location}</dd></div>
          {project.category && <div><dt className="eyebrow text-[0.6rem] text-graphite">Scope</dt><dd className="mt-1">{project.category}</dd></div>}
          {project.year && <div><dt className="eyebrow text-[0.6rem] text-graphite">Year</dt><dd className="mt-1">{project.year}</dd></div>}
        </dl>
      </header>

      {story ? (
        <ProjectStory story={story} title={project.title} />
      ) : (
        project.coverImage && (
          <div className="relative mx-auto aspect-[16/9] w-full max-w-[1600px] overflow-hidden bg-sand">
            <SkeletonImage src={project.coverImage} alt={alts[project.coverImage] || `${project.title} interior`} priority sizes="100vw" className="object-cover" />
          </div>
        )
      )}

      <div className="container-x grid gap-12 py-24 md:grid-cols-12">
        <p className="font-serif text-3xl leading-snug text-ink md:col-span-5">{project.subtitle || project.summary}</p>
        <div
          className="rich-text text-lg leading-relaxed text-graphite md:col-span-6 md:col-start-7"
          dangerouslySetInnerHTML={{ __html: toHtml(project.content) }}
        />
      </div>

      {project.gallery.length > 0 && (
        <section aria-labelledby="gallery-title" className="overflow-hidden pb-24">
          <h2 id="gallery-title" className="container-x eyebrow mb-10 text-bronze">Gallery</h2>
          <ShowcaseGallery images={project.gallery} title={project.title} alts={alts} highlights={project.highlights} />
        </section>
      )}

      {project.videos.length > 0 && (
        <section aria-labelledby="videos-title" className="container-x pb-24">
          <h2 id="videos-title" className="eyebrow mb-8 text-bronze">Videos</h2>
          <div className="grid gap-6">
            {project.videos.map((v) => (
              <VideoEmbed key={v} video={v} title={`${project.title} — 3D animation`} />
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section aria-labelledby="project-articles" className="container-x pb-24">
          <h2 id="project-articles" className="eyebrow mb-8 text-bronze">From the journal</h2>
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {articles.map((a) => (
              <li key={a.slug}>
                <Link href={`/journal/${a.slug}`} className="group flex items-baseline justify-between gap-6 py-6">
                  <span className="font-serif text-2xl text-ink md:text-3xl">{a.title}</span>
                  <span className="shrink-0 text-sm text-graphite">{formatDate(articleDate(a))} <span className="transition group-hover:translate-x-1">→</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ProjectEnquiry title={project.title} contact={site.contact} />

      {next && next.slug !== project.slug && (
        <Link href={`/projects/${next.slug}`} className="group block border-t border-ink/10">
          <div className="container-x flex items-center justify-between py-16">
            <div>
              <p className="eyebrow text-[0.62rem] text-graphite">Next project</p>
              <p className="mt-3 font-serif text-5xl text-ink md:text-7xl">{next.title}</p>
            </div>
            <span className="text-4xl transition group-hover:translate-x-2">→</span>
          </div>
        </Link>
      )}
    </article>
  );
}
