import Link from "next/link";
import Image from "next/image";
import RoomSequence from "@/components/scroll/RoomSequence";
import ProjectCard from "@/components/site/ProjectCard";
import ServiceIcon from "@/components/site/ServiceIcon";
import ContactForm from "@/components/site/ContactForm";
import JsonLd from "@/components/site/JsonLd";
import VideoEmbed from "@/components/site/VideoEmbed";
import { getProjects, getServices, getSiteContent, siteUrl } from "@/lib/data";

export default async function HomePage() {
  const [site, services, projects] = await Promise.all([
    getSiteContent(),
    getServices(),
    getProjects({ featured: true }),
  ]);
  const url = siteUrl();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: site.brandName,
          description: site.seo.description,
          url,
          image: `${url}${site.seo.ogImage}`,
          email: site.contact.email,
          telephone: site.contact.phone,
          foundingDate: "2014",
          address: { "@type": "PostalAddress", addressLocality: "London", addressCountry: "GB" },
          areaServed: ["United Kingdom", "France", "Monaco", "Switzerland", "United Arab Emirates"],
          sameAs: Object.values(site.socials).filter(Boolean),
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Services",
            itemListElement: services.map((s) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: s.title, description: s.summary, url: `${url}/services/${s.slug}` },
            })),
          },
        }}
      />

      <RoomSequence stages={site.heroStages} />

      {/* About */}
      <section id="about" className="container-x grid gap-12 py-28 md:grid-cols-12 md:py-40">
        <p className="eyebrow reveal text-bronze md:col-span-3">The studio</p>
        <div className="md:col-span-9">
          <h2 className="reveal font-serif text-[clamp(2.2rem,4.8vw,4.4rem)] font-light leading-[1.02] text-ink">
            {site.aboutTitle}
          </h2>
          <div className="mt-10 max-w-2xl space-y-5 text-lg leading-relaxed text-graphite">
            {site.aboutText.split(/\n{2,}/).map((p, i) => (
              <p key={i} className="reveal">{p}</p>
            ))}
          </div>
          <Link href="/about" className="reveal link-underline mt-8 inline-block pb-1 text-sm">Meet the team →</Link>
          <dl className="mt-16 grid grid-cols-2 gap-y-10 border-t border-ink/10 pt-10 md:grid-cols-4">
            {site.stats.map((s) => (
              <div key={s.label} className="reveal flex flex-col-reverse">
                <dt className="eyebrow mt-2 text-[0.62rem] text-graphite">{s.label}</dt>
                <dd className="font-serif text-5xl text-ink md:text-6xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Before / after */}
      <section aria-label="Before and after" className="container-x grid gap-4 pb-28 md:grid-cols-3 md:pb-40">
        {[
          { src: "/frames/poster.webp", label: "Before — the empty shell" },
          { src: "/frames/final.webp", label: "After — the finished interior" },
          { src: "/frames/detail.webp", label: "Detail — bespoke media wall & fireplace" },
        ].map((img) => (
          <figure key={img.src} className="reveal">
            <div className="relative aspect-[16/10] overflow-hidden bg-sand">
              <Image src={img.src} alt={img.label} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="eyebrow mt-4 text-[0.62rem] text-graphite">{img.label}</figcaption>
          </figure>
        ))}
      </section>

      {/* Services */}
      <section id="services" className="bg-sand py-28 text-ink md:py-40">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow reveal text-stone">What we do</p>
              <h2 className="reveal mt-5 font-serif text-[clamp(2.4rem,5vw,4.6rem)] font-light leading-none">Services</h2>
            </div>
            <p className="reveal max-w-md text-graphite">
              From the first sketch to photo-real visuals and construction drawings — every discipline your project needs.
            </p>
          </div>
          <ul className="mt-16 grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <li key={s.slug} className="reveal border-b border-line sm:odd:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0">
                <Link href={`/services/${s.slug}`} className="group flex h-full flex-col p-8 transition hover:bg-ink/5 md:p-10">
                  <div className="flex items-center justify-between text-stone">
                    <ServiceIcon name={s.icon} />
                    <span className="eyebrow text-[0.6rem] text-ink/30">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-12 font-serif text-3xl">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-graphite">{s.summary}</p>
                  <span className="eyebrow mt-auto pt-8 text-[0.6rem] text-stone transition group-hover:translate-x-1">Learn more →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Showreel */}
      {site.showreel && (
        <section aria-labelledby="showreel-title" className="bg-sand pb-28 text-ink md:pb-40">
          <div className="container-x">
            <h2 id="showreel-title" className="eyebrow reveal mb-8 text-stone">3D animation showreel</h2>
            <div className="reveal">
              <VideoEmbed video={site.showreel} title={`${site.brandName} — 3D animation showreel`} />
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      <section id="projects" className="container-x py-28 md:py-40">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow reveal text-bronze">Selected work</p>
            <h2 className="reveal mt-5 font-serif text-[clamp(2.4rem,5vw,4.6rem)] font-light leading-none">Projects</h2>
          </div>
          <Link href="/projects" className="reveal link-underline w-fit pb-1 text-sm">All projects →</Link>
        </div>
        <div className="mt-16 grid gap-x-8 gap-y-20 md:grid-cols-12">
          {projects.map((p, i) => (
            <div
              key={p.slug}
              className={i % 4 === 0 || i % 4 === 3 ? "md:col-span-7" : "md:col-span-5 md:mt-32"}
            >
              <ProjectCard project={p} index={i} large={i % 4 === 0 || i % 4 === 3} />
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section id="process" className="bg-sand py-28 md:py-40">
        <div className="container-x">
          <p className="eyebrow reveal text-bronze">How we work</p>
          <h2 className="reveal mt-5 font-serif text-[clamp(2.4rem,5vw,4.6rem)] font-light leading-none">Process</h2>
          <ol className="mt-16 grid gap-10 md:grid-cols-4">
            {site.process.map((step, i) => (
              <li key={step.title} className="reveal border-t border-ink/20 pt-6">
                <span className="font-serif text-5xl text-bronze">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 font-serif text-2xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="container-x grid gap-16 py-28 md:grid-cols-12 md:py-40">
        <div className="md:col-span-5">
          <p className="eyebrow reveal text-bronze">Start a project</p>
          <h2 className="reveal mt-5 font-serif text-[clamp(2.4rem,5vw,4.6rem)] font-light leading-none">
            Let&apos;s design your space
          </h2>
          <div className="reveal mt-10 space-y-3 text-graphite">
            <a href={`mailto:${site.contact.email}`} className="link-underline block w-fit text-lg text-ink">{site.contact.email}</a>
            <a href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`} className="link-underline block w-fit">{site.contact.phone}</a>
            <p>{site.contact.address}</p>
          </div>
        </div>
        <div className="reveal md:col-span-7">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
