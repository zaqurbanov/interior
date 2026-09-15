import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import PageHero from "@/components/site/PageHero";
import { getSiteContent, siteUrl } from "@/lib/data";

export const metadata: Metadata = {
  title: "About — Our team",
  description:
    "Meet the London studio of architects, interior designers and 3D visualisers behind A&V Interiors, working on high-end projects since 2014.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const site = await getSiteContent();
  const url = siteUrl();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          url: `${url}/about`,
          mainEntity: {
            "@type": "Organization",
            name: site.brandName,
            foundingDate: "2014",
            employee: site.team.map((t) => ({ "@type": "Person", name: t.name, jobTitle: t.role })),
          },
        }}
      />
      <PageHero eyebrow="About us" title="Our team" />

      <section className="container-x grid gap-10 pb-24 md:grid-cols-12">
        <div className="space-y-6 text-lg leading-relaxed text-graphite md:col-span-7 md:col-start-6">
          {site.aboutText.split(/\n{2,}/).map((p, i) => (
            <p key={i} className="reveal">{p}</p>
          ))}
        </div>
      </section>

      <section aria-label="Team members" className="container-x grid gap-x-8 gap-y-20 pb-32 sm:grid-cols-2 lg:grid-cols-4">
        {site.team.map((m) => (
          <article key={m.name} className="reveal">
            <div className="relative aspect-[3/4] overflow-hidden bg-sand">
              {m.photo && (
                <Image src={m.photo} alt={`${m.name}, ${m.role}`} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover grayscale-[20%]" />
              )}
            </div>
            <h2 className="mt-6 font-serif text-3xl">{m.name}</h2>
            <p className="eyebrow mt-1 text-[0.62rem] text-bronze">{m.role}</p>
            <p className="mt-4 text-sm leading-relaxed text-graphite">{m.bio}</p>
          </article>
        ))}
      </section>

      <section className="border-t border-line bg-sand text-ink">
        <div className="container-x flex flex-col items-start justify-between gap-8 py-24 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-stone">Let&apos;s talk</p>
            <h2 className="mt-5 font-serif text-[clamp(2.4rem,5vw,4.6rem)] font-light leading-none">Let&apos;s bring your vision to life</h2>
          </div>
          <Link href="/contact" className="rounded-full bg-ink px-8 py-4 text-sm text-ivory transition hover:bg-bronze hover:text-ivory">
            Contact us
          </Link>
        </div>
      </section>
    </>
  );
}
