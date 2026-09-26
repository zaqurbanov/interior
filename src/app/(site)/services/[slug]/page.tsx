import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import PageHero from "@/components/site/PageHero";
import ServiceIcon from "@/components/site/ServiceIcon";
import { toHtml } from "@/lib/rich-text";
import { getImageAlts, getProjectsForService, getService, getServices, getSiteContent, siteUrl } from "@/lib/data";
import ProjectCard from "@/components/site/ProjectCard";
import { metaDescription } from "@/lib/meta";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  const title = service.seo.title || `${service.title} in London`;
  const description = service.seo.description || metaDescription(service.summary);
  return { title, description, alternates: { canonical: `/services/${service.slug}` }, openGraph: { title, description } };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [service, services, site, alts, work] = await Promise.all([
    getService(slug),
    getServices(),
    getSiteContent(),
    getImageAlts(),
    getProjectsForService(slug),
  ]);
  if (!service) notFound();
  const url = siteUrl();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.summary,
          serviceType: service.title,
          url: `${url}/services/${service.slug}`,
          provider: { "@type": "ProfessionalService", name: site.brandName, url },
          areaServed: ["United Kingdom", "France", "Monaco", "Switzerland", "United Arab Emirates"],
        }}
      />
      <PageHero eyebrow="Service" title={service.title} intro={service.summary} />
      {service.image && (
        <div className="relative mx-auto mb-20 aspect-[21/9] w-full max-w-[1600px] overflow-hidden bg-sand">
          <Image src={service.image} alt={alts[service.image] || `${service.title} by ${site.brandName}`} fill priority sizes="100vw" className="object-cover" />
        </div>
      )}
      <section className="container-x grid gap-12 pb-24 md:grid-cols-12">
        <div className="text-bronze md:col-span-4">
          <ServiceIcon name={service.icon} className="h-16 w-16" />
        </div>
        <div className="space-y-6 text-lg leading-relaxed text-graphite md:col-span-7">
          <div className="rich-text" dangerouslySetInnerHTML={{ __html: toHtml(service.content) }} />
          {service.features.length > 0 && (
            <ul className="divide-y divide-ink/10 border-y border-ink/10 text-base text-ink">
              {service.features.map((f) => (
                <li key={f} className="flex gap-4 py-4">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-bronze" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          )}
          <Link href="/contact" className="mt-6 inline-block rounded-full bg-ink px-8 py-4 text-sm text-ivory transition hover:bg-bronze">
            Discuss your project
          </Link>
        </div>
      </section>
      {work.length > 0 && (
        <section aria-labelledby="service-work" className="border-t border-ink/10">
          <div className="container-x py-20 md:py-28">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="eyebrow reveal text-bronze">Selected work</p>
                <h2 id="service-work" className="reveal mt-5 font-serif text-[clamp(2.2rem,4.5vw,4rem)] font-light leading-none">
                  {service.title} in our projects
                </h2>
              </div>
              <Link href="/projects" className="reveal link-underline w-fit pb-1 text-sm">All projects →</Link>
            </div>
            <div className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-3">
              {work.map((p, i) => (
                <ProjectCard key={p.slug} project={p} index={i} alt={alts[p.coverImage]} />
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="border-t border-ink/10">
        <div className="container-x py-16">
          <p className="eyebrow text-[0.62rem] text-graphite">Other services</p>
          <ul className="mt-6 flex flex-wrap gap-3">
            {services.filter((s) => s.slug !== service.slug).map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="block rounded-full border border-ink/20 px-5 py-2 text-sm transition hover:bg-ink hover:text-ivory">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
