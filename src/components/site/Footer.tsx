import Link from "next/link";
import Logo, { LEGAL_NAME } from "./Logo";
import type { SiteContentData } from "@/lib/types";
import { telHref, whatsappHref } from "@/lib/contact-links";

export default function Footer({ site, journal = false }: { site: SiteContentData; journal?: boolean }) {
  const socials = [
    { href: site.socials.instagram, label: "Instagram" },
    { href: site.socials.linkedin, label: "LinkedIn" },
    { href: site.socials.youtube, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-line bg-sand text-ink">
      <div className="container-x grid gap-12 py-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo brandName={site.brandName} className="text-2xl md:text-3xl" />
          <p className="eyebrow mt-4 text-[0.62rem] text-ink/55">{LEGAL_NAME}</p>
          <p className="mt-3 max-w-sm text-sm text-graphite">{site.tagline}</p>
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow mb-4 text-ink/55">Contact</p>
          <address className="space-y-2 text-sm not-italic text-ink/80">
            <a className="link-underline block w-fit" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            <a className="link-underline block w-fit" href={telHref(site.contact.phone)}>{site.contact.phone}</a>
            {site.contact.whatsapp && (
              <a className="link-underline block w-fit" href={whatsappHref(site.contact.whatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            )}
            <p>{site.contact.address}</p>
          </address>
        </div>
        <div className="md:col-span-2">
          <p className="eyebrow mb-4 text-ink/55">Explore</p>
          <ul className="space-y-2 text-sm text-ink/80">
            <li><Link className="link-underline" href="/projects">Portfolio</Link></li>
            <li><Link className="link-underline" href="/about">About</Link></li>
            <li><Link className="link-underline" href="/#services">Services</Link></li>
            {journal && <li><Link className="link-underline" href="/journal">Journal</Link></li>}
            <li><Link className="link-underline" href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="eyebrow mb-4 text-ink/55">Follow</p>
          <ul className="space-y-2 text-sm text-ink/80">
            {socials.map((s) => (
              <li key={s.label}>
                <a className="link-underline" href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-col justify-between gap-2 border-t border-line py-6 text-xs text-ink/55 md:flex-row">
        <p>© {new Date().getFullYear()} {LEGAL_NAME}. All rights reserved.</p>
        <p>Interior Design · 3D Visualisation · London</p>
      </div>
    </footer>
  );
}
