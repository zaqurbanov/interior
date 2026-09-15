"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Logo, { initials } from "./Logo";

type Phase = "idle" | "cover" | "reveal";

const MIN_VISIBLE_MS = 700; // keep the mark on screen long enough to read
const REVEAL_MS = 600;
const FAILSAFE_MS = 8000;

/** Branded overlay shown while navigating between pages. */
export default function PageTransition({ brandName }: { brandName: string }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const startedAt = useRef(0);
  const lastPath = useRef(pathname);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  // Start the cover on internal link clicks that change the page.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // same page / hash links
      if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return;

      clearTimers();
      startedAt.current = Date.now();
      setPhase("cover");
      timers.current.push(window.setTimeout(() => setPhase("idle"), FAILSAFE_MS));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // New page rendered: hold briefly, then reveal it.
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    if (phase !== "cover") return;
    clearTimers();
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt.current));
    timers.current.push(
      window.setTimeout(() => setPhase("reveal"), wait),
      window.setTimeout(() => setPhase("idle"), wait + REVEAL_MS),
    );
  }, [pathname, phase]);

  useEffect(() => clearTimers, []);

  const mark = initials(brandName);

  return (
    <div
      aria-hidden={phase === "idle"}
      role="status"
      aria-live="polite"
      data-phase={phase}
      className="page-transition pointer-events-none fixed inset-0 z-[90] grid place-items-center bg-black text-white data-[phase=cover]:pointer-events-auto"
    >
      {phase !== "idle" && <span className="sr-only">Loading page</span>}
      <div className="flex flex-col items-center">
        <p className="font-serif text-[clamp(3.5rem,10vw,7rem)] font-light leading-none tracking-tight">
          {mark.split("").map((ch, i) => (
            <span key={i} className="pt-letter inline-block" style={{ animationDelay: `${i * 80}ms` }}>
              {ch}
            </span>
          ))}
        </p>
        <div className="pt-sub mt-5 text-white/70">
          <Logo brandName={brandName} className="text-xs md:text-sm" />
        </div>
        <div className="mt-8 h-px w-40 overflow-hidden bg-white/15">
          <div className="pt-bar h-full w-1/3 bg-bronze" />
        </div>
      </div>
    </div>
  );
}
