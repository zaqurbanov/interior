"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fades `.reveal` elements in (CSS transition on [data-revealed], see globals.css).
 * Re-runs on every client-side navigation — the layout persists, so a mount-only
 * effect never saw the new page's elements — and immediately reveals anything
 * already on or above the screen, e.g. after jumping to /#services.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const pending = () => Array.from(document.querySelectorAll<HTMLElement>(".reveal:not([data-revealed])"));
    const reveal = (els: HTMLElement[]) =>
      els.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
        el.setAttribute("data-revealed", "");
      });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        visible.forEach((el) => observer.unobserve(el));
        reveal(visible);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    const sweep = () => {
      const els = pending();
      // Already on screen or scrolled past (hash jumps): show now.
      reveal(els.filter((el) => el.getBoundingClientRect().top < window.innerHeight * 0.95));
      pending().forEach((el) => observer.observe(el));
    };

    // Run after the new page is laid out and after any hash-landing corrections.
    const timers = [60, 750, 1600].map((ms) => window.setTimeout(sweep, ms));

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
