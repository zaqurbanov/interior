"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Bouncing arrow at the bottom of a scroll-scrubbed section. It invites the
 * scroll, and a click jumps straight past the section for visitors who would
 * rather not sit through the animation.
 */
export default function SkipArrow({
  sectionRef,
  label = "Scroll",
  skipLabel = "Skip",
  locked = false,
  onSkip,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  label?: string;
  skipLabel?: string;
  /** Scrolling is held on this section (phones), so the arrow is the way on. */
  locked?: boolean;
  /** Runs before the jump — e.g. to lift that hold. */
  onSkip?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  // Nudge it once after a moment of stillness, so it keeps catching the eye.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => el.setAttribute("data-moving", "true");
    let t: number;
    const onIdle = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => el.removeAttribute("data-moving"), 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onIdle, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onIdle);
    };
  }, []);

  const skip = () => {
    const section = sectionRef.current;
    if (!section) return;
    onSkip?.();
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void; resize: () => void } })
      .__lenis;
    // Land on what follows the animation, not on its last frame.
    const targetTop = () => {
      const next = section.nextElementSibling as HTMLElement | null;
      const el = next ?? section;
      return next
        ? el.getBoundingClientRect().top + window.scrollY
        : section.getBoundingClientRect().top + window.scrollY + section.offsetHeight;
    };
    const go = (duration: number) => {
      const top = targetTop();
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(top, { duration, force: true });
      } else {
        window.scrollTo({ top, behavior: "smooth" });
      }
    };
    go(1.2);
    // Images loading underneath can shift the page mid-flight; re-align once.
    window.setTimeout(() => {
      const off = targetTop() - window.scrollY;
      if (Math.abs(off) > 24) go(0.4);
    }, 1500);
  };

  // A named group: the home sequence's wrapper is itself a `group` (for its
  // dark-scene styles), and a plain group-hover would light the arrow up
  // whenever the pointer was anywhere over the animation.
  return (
    <button
      ref={ref}
      type="button"
      onClick={skip}
      aria-label="Skip the animation and continue"
      className="group/skip absolute bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-2 whitespace-nowrap text-ink drop-shadow-[0_2px_14px_rgba(0,0,0,0.75)] transition-colors md:bottom-6"
    >
      {/* Phones get the short word so the label never wraps over the copy. */}
      <span className="eyebrow text-[0.6rem] text-ink/85 transition-opacity duration-300 group-hover/skip:opacity-0">
        <span className="md:hidden">{locked ? "Continue" : "Scroll"}</span>
        <span className="hidden md:inline">{label}</span>
      </span>
      <span className="eyebrow absolute top-0 text-[0.6rem] text-bronze opacity-0 transition-opacity duration-300 group-hover/skip:opacity-100">
        {skipLabel}
      </span>
      <span className="skip-arrow grid h-11 w-11 place-items-center rounded-full border border-ink/50 bg-ivory/35 transition-colors duration-300 group-hover/skip:border-ink group-hover/skip:bg-ink group-hover/skip:text-ivory">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-5 w-5" aria-hidden="true">
          <path d="M12 4v15M6 13.5 12 20l6-6.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
}
