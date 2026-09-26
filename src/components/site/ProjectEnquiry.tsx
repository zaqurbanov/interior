import Link from "next/link";
import { telHref, whatsappHref } from "@/lib/contact-links";
import type { SiteContentData } from "@/lib/types";

/** End of a project page: the moment a visitor is most taken with the work, so offer the next step. */
export default function ProjectEnquiry({ title, contact }: { title: string; contact: SiteContentData["contact"] }) {
  return (
    <section aria-labelledby="project-enquiry" className="border-t border-ink/10">
      <div className="container-x grid gap-10 py-20 md:grid-cols-12 md:items-end md:py-28">
        <div className="md:col-span-7">
          <p className="eyebrow reveal text-bronze">Your project</p>
          <h2 id="project-enquiry" className="reveal mt-5 font-serif text-[clamp(2.2rem,4.5vw,4rem)] font-light leading-[1.02] text-ink">
            Planning something like {title}?
          </h2>
          <p className="reveal mt-6 max-w-xl text-lg leading-relaxed text-graphite">
            Tell us about your space and how you want to live in it. We will come back to you personally with next steps.
          </p>
        </div>
        <div className="reveal flex flex-col gap-4 md:col-span-5 md:items-end">
          <Link
            href={`/contact?project=${encodeURIComponent(title)}`}
            className="inline-block rounded-full bg-ink px-8 py-4 text-center text-sm text-ivory transition hover:bg-bronze"
          >
            Start your project
          </Link>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-graphite md:justify-end">
            {contact.whatsapp && (
              <a
                href={whatsappHref(contact.whatsapp, `Hello, I saw ${title} on your website and would like to talk about my project.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                WhatsApp
              </a>
            )}
            {contact.phone && <a href={telHref(contact.phone)} className="link-underline">{contact.phone}</a>}
            <a href={`mailto:${contact.email}?subject=${encodeURIComponent(`Project like ${title}`)}`} className="link-underline">{contact.email}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
