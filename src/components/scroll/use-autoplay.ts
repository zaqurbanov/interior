"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AUTOPLAY_QUERY } from "@/lib/autoplay";

/** true on phones (autoplay), false from md up (scroll), null until mounted. */
export function useAutoplayMode() {
  const [on, setOn] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(AUTOPLAY_QUERY);
    const sync = () => setOn(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return on;
}

/**
 * Plays while at least 40% of the section is on screen and pauses when it
 * scrolls away, so the walkthrough is not over before the visitor gets there.
 */
export function watchVisibility(el: Element, onChange: (visible: boolean) => void) {
  const io = new IntersectionObserver(([e]) => onChange(e.intersectionRatio >= 0.4), { threshold: [0, 0.4] });
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Phones: keep the page on an autoplaying sequence until the visitor taps its
 * arrow. Scrolling down past the section is blocked (a swipe up still works,
 * so a project page's header stays reachable); `release()` — called by the
 * arrow, or by any in-page "#" link — frees the page for the rest of the visit.
 */
export function useScrollGate(sectionRef: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [open, setOpen] = useState(false);
  // Read by the listeners, so a release takes effect before React re-renders —
  // the arrow's own scroll starts in the same tick.
  const released = useRef(false);
  const release = useCallback(() => {
    released.current = true;
    setOpen(true);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!enabled || open || !section) return;
    // Arrived for a section further down (/#services from the menu, footer or
    // another site): that is where the visitor wants to be, so never hold them.
    if (window.location.hash) {
      release();
      return;
    }
    // Furthest the page may scroll: the section's top at the top of the screen.
    const limit = () => section.getBoundingClientRect().top + window.scrollY;
    let lastY = 0;

    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? lastY;
      const down = y < lastY; // finger moving up = page scrolling down
      lastY = y;
      if (!released.current && down && window.scrollY >= limit() - 1 && e.cancelable) e.preventDefault();
    };
    // Momentum, keyboard or wheel can still overshoot; pull back to the limit.
    // Wheel scrolling runs through Lenis, which keeps its own target, so tell it too.
    const onScroll = () => {
      if (released.current) return;
      if (window.location.hash) return release();
      const max = limit();
      if (window.scrollY <= max + 1) return;
      const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis;
      if (lenis) lenis.scrollTo(max, { immediate: true, force: true });
      else window.scrollTo(0, max);
    };
    const onClick = (e: MouseEvent) => {
      // Any in-page link ("#contact", "/#services") means "take me there".
      if ((e.target as Element | null)?.closest?.('a[href*="#"]')) release();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
    };
  }, [sectionRef, enabled, open, release]);

  return { locked: enabled && !open, release };
}
