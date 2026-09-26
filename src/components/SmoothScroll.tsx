"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HEADER_OFFSET = -80;

export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    // Other components (e.g. the skip arrow) scroll through this instance.
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Links to the current page: smooth-scroll to the anchor, or to the top.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      if (url.hash) {
        const el = document.querySelector(url.hash);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: HEADER_OFFSET });
        history.replaceState(null, "", url.hash);
        // Move keyboard focus too, as a native anchor jump would ("Skip to content").
        if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
        (el as HTMLElement).focus({ preventScroll: true });
      } else {
        e.preventDefault();
        lenis.scrollTo(0);
        history.replaceState(null, "", url.pathname);
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  // After client-side navigation Lenis still holds the previous page's scroll
  // position and height: without this the new page opens at its footer, and hash
  // links stop short (/about → /#services landed inside the hero).
  // Reset to the top first, re-measure, then land on the hash target.
  const isFirstRender = useRef(true);
  const isPopNavigation = useRef(false);

  useEffect(() => {
    const onPop = () => (isPopNavigation.current = true);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    const hash = window.location.hash;

    const restored = isFirstRender.current || isPopNavigation.current; // first load / back / forward
    isFirstRender.current = false;
    isPopNavigation.current = false;

    const toTop = () => {
      lenis?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    };
    if (!restored && !hash) {
      lenis?.resize();
      toTop();
    }

    // Stop correcting as soon as the visitor scrolls on their own.
    let userScrolled = false;
    const onUser = () => (userScrolled = true);
    const userEvents = ["wheel", "touchstart", "keydown"] as const;
    userEvents.forEach((ev) => window.addEventListener(ev, onUser, { passive: true, once: true }));
    const land = () => {
      if (userScrolled) return;
      lenis?.resize();
      ScrollTrigger.refresh();
      const target = window.location.hash;
      if (!target) {
        // Layout shifts (images, fonts) can leave a fresh page scrolled down.
        if (!restored && window.scrollY > 0) toTop();
        return;
      }
      const el = document.querySelector(target) as HTMLElement | null;
      if (!el) return;
      if (Math.abs(el.getBoundingClientRect().top + HEADER_OFFSET) < 8) return; // already in place
      if (lenis) lenis.scrollTo(el, { offset: HEADER_OFFSET, immediate: true, force: true });
      else el.scrollIntoView();
    };
    // Land once the page is laid out, then correct for images/fonts shifting the layout.
    const timers = [120, 700, 1500].map((ms) => window.setTimeout(land, ms));
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      userEvents.forEach((ev) => window.removeEventListener(ev, onUser));
    };
  }, [pathname]);

  return null;
}
