import type { Metadata } from "next";
import ContactForm from "@/components/site/ContactForm";
import PageHero from "@/components/site/PageHero";
import { getSiteContent } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with our London interior design and 3D visualisation studio to discuss your project.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const site = await getSiteContent();
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's design your space" intro="Tell us about your project and we will reply within one working day." />
      <section className="container-x grid gap-16 pb-32 md:grid-cols-12">
        <address className="space-y-8 not-italic md:col-span-4">
          <div>
            <p className="eyebrow text-[0.62rem] text-graphite">Email</p>
            <a href={`mailto:${site.contact.email}`} className="link-underline mt-2 inline-block text-lg">{site.contact.email}</a>
          </div>
          <div>
            <p className="eyebrow text-[0.62rem] text-graphite">Phone</p>
            <a href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`} className="link-underline mt-2 inline-block text-lg">{site.contact.phone}</a>
          </div>
          <div>
            <p className="eyebrow text-[0.62rem] text-graphite">Studio</p>
            <p className="mt-2 text-lg">{site.contact.address}</p>
          </div>
        </address>
        <div className="md:col-span-8">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
