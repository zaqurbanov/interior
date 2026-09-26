"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";

// Same structure as the original site: Home, Portfolio, About, Services, Contact.
const baseNav = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/contact", label: "Contact" },
];
// "Journal" sits before Contact once there are articles.
const withJournal = [...baseNav.slice(0, 4), { href: "/journal", label: "Journal" }, baseNav[4]];

function isActive(href: string, pathname: string) {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Header({ brandName, journal = false }: { brandName: string; journal?: boolean }) {
  const nav = journal ? withJournal : baseNav;
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

  // Once the page scrolls the bar slims down (80 → 64px on desktop, 64 → 56px on
  // phones); the open menu keeps the full height so its panel lines up.
  const compact = scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ease-out ${
        open ? "border-transparent bg-ivory" : scrolled ? "border-line bg-ivory/85 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div
        className={`container-x flex items-center justify-between transition-[height] duration-500 ease-out ${
          compact ? "h-14 md:h-16" : "h-16 md:h-20"
        }`}
      >
        <Link href="/" className="text-ink" onClick={() => setOpen(false)}>
          <Logo
            brandName={brandName}
            className={`origin-left text-base transition-transform duration-500 ease-out md:text-lg ${compact ? "scale-[0.9]" : ""}`}
          />
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
          className={`hidden rounded-full border border-ink/30 px-5 text-sm transition-all duration-500 hover:bg-ink hover:text-ivory lg:inline-block ${
            compact ? "py-1.5" : "py-2"
          }`}
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
