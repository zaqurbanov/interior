"use client";

import { useEffect, useState } from "react";
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
