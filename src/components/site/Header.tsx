"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open ? "bg-ivory/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="font-serif text-2xl tracking-tight text-ink" onClick={() => setOpen(false)}>
          {brandName}
        </Link>
        <nav aria-label="Main" className="hidden md:block">
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
          className="hidden rounded-full border border-ink/30 px-5 py-2 text-sm transition hover:bg-ink hover:text-ivory md:inline-block"
        >
          Enquire
        </Link>
        <button
          type="button"
          className="relative h-10 w-10 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`absolute left-2 right-2 h-px bg-ink transition ${open ? "top-5 rotate-45" : "top-4"}`} />
          <span className={`absolute left-2 right-2 h-px bg-ink transition ${open ? "top-5 -rotate-45" : "top-6"}`} />
        </button>
      </div>
      {open && (
        <nav aria-label="Mobile" className="container-x pb-8 md:hidden">
          <ul className="flex flex-col gap-4">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(n.href, pathname) ? "page" : undefined}
                  className="font-serif text-3xl text-ink/60 aria-[current=page]:text-ink"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
