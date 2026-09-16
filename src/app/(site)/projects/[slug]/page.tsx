import type { Metadata } from "next";
import SkeletonImage from "@/components/site/SkeletonImage";
import ProjectStory from "@/components/scroll/ProjectStory";
import { getProjectStory } from "@/lib/project-story";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import Gallery from "@/components/site/Gallery";
import VideoEmbed from "@/components/site/VideoEmbed";
import { getProject, getProjects, getSiteContent, siteUrl } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  const title = project.seo.title || `${project.title} — ${project.category || "Design"} in ${project.location}`;
  const description = project.seo.description || project.summary;
  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { type: "article", title, description, images: project.coverImage ? [project.coverImage] : undefined },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project, all, site] = await Promise.all([getProject(slug), getProjects(), getSiteContent()]);
  if (!project) notFound();
  const story = getProjectStory(project.slug);

  const idx = all.findIndex((p) => p.slug === project.slug);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null;
  const url = siteUrl();

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CreativeWork",
              name: project.title,
              description: project.summary,
              image: [project.coverImage, ...project.gallery].filter(Boolean).slice(0, 6).map((i) => `${url}${i}`),
              locationCreated: { "@type": "Place", name: project.location },
              creator: { "@type": "Organization", name: site.brandName, url },
              url: `${url}/projects/${project.slug}`,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: url },
                { "@type": "ListItem", position: 2, name: "Projects", item: `${url}/projects` },
                { "@type": "ListItem", position: 3, name: project.title, item: `${url}/projects/${project.slug}` },
              ],
            },
          ],
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
            <SkeletonImage src={project.coverImage} alt={`${project.title} interior`} priority sizes="100vw" className="object-cover" />
          </div>
        )
      )}

      <div className="container-x grid gap-12 py-24 md:grid-cols-12">
        <p className="font-serif text-3xl leading-snug text-ink md:col-span-5">{project.subtitle || project.summary}</p>
        <div className="space-y-6 text-lg leading-relaxed text-graphite md:col-span-6 md:col-start-7">
          {project.content.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      {project.gallery.length > 0 && (
        <section aria-labelledby="gallery-title" className="container-x pb-24">
          <h2 id="gallery-title" className="eyebrow mb-8 text-bronze">Gallery</h2>
          <Gallery images={project.gallery} title={project.title} />
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
