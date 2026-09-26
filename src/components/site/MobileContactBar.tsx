"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { telHref, whatsappHref } from "@/lib/contact-links";
import type { SiteContentData } from "@/lib/types";

// Phones only: the header has no room for "Enquire", so the way to get in touch
// sits at the bottom of the screen. It waits until the visitor has scrolled a
// little, and steps aside wherever it would cover something: a walkthrough
// (its Continue / Replay buttons), the contact form, the footer, the contact page.
const AVOID = "[data-walkthrough], #contact, footer";

export default function MobileContactBar({ contact }: { contact: SiteContentData["contact"] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [covered, setCovered] = useState(0);
  // On a project page, the enquiry and WhatsApp message name the project.
  const [project, setProject] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const inView = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inView.add(e.target);
          else inView.delete(e.target);
        }
        setCovered(inView.size);
      },
      // A walkthrough counts while it fills a good part of the screen.
      { threshold: 0, rootMargin: "-25% 0px -25% 0px" },
    );
    // The layout persists across navigation; look for the new page's sections.
    const t = window.setTimeout(() => {
      document.querySelectorAll(AVOID).forEach((el) => io.observe(el));
      setProject(pathname.startsWith("/projects/") ? (document.querySelector("main h1")?.textContent?.trim().slice(0, 120) ?? "") : "");
    }, 50);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      setCovered(0);
    };
  }, [pathname]);

  if (pathname === "/contact") return null;
  const show = scrolled && covered === 0;
  const message = project ? `Hello, I saw ${project} on your website and would like to talk about my project.` : "Hello, I would like to talk about my project.";

  return (
    <nav
        aria-label="Contact"
        aria-hidden={!show}
        inert={!show}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-500 md:hidden ${
          show ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className={`grid h-14 text-sm ${contact.whatsapp ? "grid-cols-3" : "grid-cols-2"}`}>
          <Link
            href={project ? `/contact?project=${encodeURIComponent(project)}` : "/contact"}
            className="grid place-items-center bg-ink font-medium text-ivory"
          >
            Enquire
          </Link>
          {contact.whatsapp && (
            <a href={whatsappHref(contact.whatsapp, message)} target="_blank" rel="noopener noreferrer" className="grid place-items-center text-ink">
              WhatsApp
            </a>
          )}
          <a href={telHref(contact.phone)} className="grid place-items-center border-l border-line text-ink">
            Call
          </a>
        </div>
    </nav>
  );
}
