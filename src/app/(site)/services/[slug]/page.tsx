import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import PageHero from "@/components/site/PageHero";
import ServiceIcon from "@/components/site/ServiceIcon";
import { getImageAlts, getService, getServices, getSiteContent, siteUrl } from "@/lib/data";

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
  const description = service.seo.description || service.summary;
  return { title, description, alternates: { canonical: `/services/${service.slug}` }, openGraph: { title, description } };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [service, services, site, alts] = await Promise.all([getService(slug), getServices(), getSiteContent(), getImageAlts()]);
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
          {service.content.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
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
