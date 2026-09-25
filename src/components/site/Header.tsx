"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";

// Same structure as the original site: Home, Portfolio, About, Services, Contact.
const nav = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

function isActive(href: string, pathname: string) {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Header({ brandName }: { brandName: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: freeze the page behind it and close on Escape.
  useEffect(() => {
    if (!open) return;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close it when navigating.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        open ? "bg-ivory" : scrolled ? "bg-ivory/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        <Link href="/" aria-label={`${brandName} — home`} className="text-ink" onClick={() => setOpen(false)}>
          <Logo brandName={brandName} className="text-base md:text-lg" />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-9 font-serif text-[0.95rem] text-ink/80">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(n.href, pathname) ? "page" : undefined}
                  className="link-underline pb-0.5 hover:text-ink aria-[current=page]:bg-[length:100%_1px] aria-[current=page]:text-ink"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          href="/contact"
          className="hidden rounded-full border border-ink/30 px-5 py-2 text-sm transition hover:bg-ink hover:text-ivory lg:inline-block"
        >
          Enquire
        </Link>
        <button
          type="button"
          className="relative h-10 w-10 cursor-pointer lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`absolute left-2 right-2 h-px bg-ink transition ${open ? "top-5 rotate-45" : "top-4"}`} />
          <span className={`absolute left-2 right-2 h-px bg-ink transition ${open ? "top-5 -rotate-45" : "top-6"}`} />
        </button>
      </div>
      {open && (
        // Full-screen panel on a solid ground, so page content never shows through.
        <nav
          aria-label="Mobile"
          className="fixed inset-x-0 bottom-0 top-16 flex flex-col justify-between overflow-y-auto bg-ivory lg:hidden md:top-20"
        >
          <ul className="container-x flex flex-col gap-2 pt-8">
            {nav.map((n, i) => (
              <li key={n.href} className="border-b border-line">
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(n.href, pathname) ? "page" : undefined}
                  className="flex items-baseline justify-between py-4 font-serif text-3xl text-ink/70 aria-[current=page]:text-ink"
                >
                  {n.label}
                  <span className="eyebrow text-[0.6rem] text-ink/30">{String(i + 1).padStart(2, "0")}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="container-x pb-[calc(2rem+env(safe-area-inset-bottom))] pt-10">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="block rounded-full bg-ink py-4 text-center text-sm tracking-wide text-ivory"
            >
              Start your project
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
