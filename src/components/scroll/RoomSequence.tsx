"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Stage } from "@/lib/types";
import {
  SCENE1_FRAMES,
  SCENE2_START,
  SCROLL_VH,
  STAGE_AT,
  STAGE_DETAILS,
  TOTAL_FRAMES,
  TOTAL_UNITS,
  frameUrl,
  unitToFrame,
  type FrameSet,
} from "@/lib/sequence";

gsap.registerPlugin(ScrollTrigger);

// Scroll progress (0–1) at which each stage starts; the last stage runs to 1.
const STAGE_STARTS = STAGE_AT.map((u) => u / TOTAL_UNITS);
const FADE = 0.03;
// Stages shown over the darker scene2 close-ups use light text.
const DARK_FROM = STAGE_AT[5] / TOTAL_UNITS;
const SCENE2_PROGRESS = SCENE2_START / TOTAL_UNITS;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const shortLabel = (eyebrow: string) => eyebrow.split("—").pop()?.trim() ?? eyebrow;

export default function RoomSequence({ stages }: { stages: Stage[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hintRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [loaded, setLoaded] = useState(0);

  const starts = STAGE_STARTS.slice(0, stages.length);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const set: FrameSet = window.innerWidth * Math.min(window.devicePixelRatio, 2) < 1500 ? "mobile" : "desktop";
    const images: (HTMLImageElement | null)[] = new Array(TOTAL_FRAMES).fill(null);
    const state = { unit: 0 };
    let drawn = -1;
    let cancelled = false;

    const nearestLoaded = (i: number) => {
      for (let d = 0; d < TOTAL_FRAMES; d++) {
        if (images[i - d]) return images[i - d];
        if (images[i + d]) return images[i + d];
      }
      return null;
    };

    const render = (force = false) => {
      const i = unitToFrame(state.unit);
      if (!force && i === drawn) return;
      const img = nearestLoaded(i);
      if (!img) return;
      drawn = images[i] ? i : -1;
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      render(true);
    };

    // Load first frame immediately, then the rest in parallel batches.
    let count = 0;
    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (cancelled) return resolve();
          images[i] = img;
          count++;
          if (count % 8 === 0 || count === TOTAL_FRAMES) setLoaded(count);
          if (Math.abs(unitToFrame(state.unit) - i) < 3 || drawn === -1) render(true);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = frameUrl(i, set);
      });

    const loadRange = async (from: number, to: number) => {
      const queue = Array.from({ length: to - from }, (_, k) => from + k);
      const workers = Array.from({ length: 6 }, async () => {
        while (queue.length && !cancelled) await load(queue.shift()!);
      });
      await Promise.all(workers);
    };

    // First frame, then all of scene1, then scene2 (or scene2 early if the
    // visitor scrolls past the pause before scene1 finished loading).
    let scene2Started = false;
    const startScene2 = () => {
      if (scene2Started) return;
      scene2Started = true;
      loadRange(SCENE1_FRAMES, TOTAL_FRAMES);
    };
    (async () => {
      await load(0);
      resize();
      await loadRange(1, SCENE1_FRAMES);
      startScene2();
    })();

    const updateOverlays = (p: number) => {
      stageRefs.current.forEach((el, i) => {
        if (!el) return;
        const a = starts[i];
        const b = starts[i + 1] ?? 1.01;
        const fadeIn = i === 0 ? 1 : clamp01((p - a) / FADE);
        const fadeOut = i === starts.length - 1 ? 1 : clamp01((b - p) / FADE);
        const o = Math.min(fadeIn, fadeOut);
        el.style.opacity = String(o);
        el.style.transform = `translateY(${(1 - fadeIn) * 40 - (1 - fadeOut) * 40}px)`;
        el.style.pointerEvents = o > 0.5 ? "auto" : "none";
        el.setAttribute("aria-hidden", o > 0.5 ? "false" : "true");
      });
      const active = starts.reduce((acc, s, i) => (p >= s - 0.001 ? i : acc), 0);
      dotRefs.current.forEach((d, i) => {
        if (!d) return;
        const state = i === active ? "current" : i < active ? "past" : "future";
        d.setAttribute("data-state", state);
        if (state === "current") d.setAttribute("aria-current", "step");
        else d.removeAttribute("aria-current");
      });
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (hintRef.current) hintRef.current.style.opacity = String(1 - clamp01(p / 0.02));
      const dark = clamp01((p - DARK_FROM + FADE) / FADE);
      if (darkRef.current) darkRef.current.style.opacity = String(dark);
      stickyRef.current?.setAttribute("data-dark", String(dark > 0.5));
      if (chapterRef.current) chapterRef.current.textContent = p >= SCENE2_PROGRESS ? "02" : "01";
      if (counterRef.current) counterRef.current.textContent = String(active + 1).padStart(2, "0");
      if (p > SCENE2_PROGRESS * 0.8) startScene2();
    };

    const tween = gsap.to(state, {
      unit: TOTAL_UNITS - 1,
      ease: "none",
      onUpdate: () => render(),
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => updateOverlays(self.progress),
      },
    });
    updateOverlays(0);

    window.addEventListener("resize", resize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages.length]);

  const pct = Math.round((loaded / TOTAL_FRAMES) * 100);

  return (
    <section
      ref={sectionRef}
      aria-label="From empty room to finished interior and a walk inside"
      className="relative"
      style={{ height: `${SCROLL_VH}vh` }}
    >
      <div ref={stickyRef} data-dark="false" className="group sticky top-0 h-svh w-full overflow-hidden bg-sand">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/frames/final.webp" alt="Finished living room interior" className="absolute inset-0 h-full w-full object-cover" />
        </noscript>

        {/* Legibility gradients: light for scene1, dark for scene2 close-ups */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ivory/90 via-ivory/40 to-transparent md:via-ivory/25" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ivory/70 to-transparent md:hidden" />
        <div ref={darkRef} className="pointer-events-none absolute inset-0 opacity-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent md:hidden" />
        </div>

        {/* Stage copy */}
        <div className="container-x relative flex h-full items-end pb-[14vh] md:items-center md:pb-0">
          <div className="relative w-full max-w-xl">
            {stages.map((s, i) => {
              const Heading = i === 0 ? "h1" : "h2";
              return (
                <div
                  key={i}
                  ref={(el) => {
                    stageRefs.current[i] = el;
                  }}
                  className={`${i === 0 ? "relative" : "absolute inset-x-0 bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2"} will-change-transform`}
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <p className="eyebrow mb-5 text-bronze">{s.eyebrow}</p>
                  <Heading className="font-serif text-[clamp(2.6rem,6.5vw,5.8rem)] font-light leading-[0.95] tracking-tight text-ink">
                    {s.title}
                  </Heading>
                  <p className="mt-6 max-w-md text-base leading-relaxed text-ink/75 md:text-lg">
                    {s.text}
                  </p>
                  {i === stages.length - 1 && (
                    <div className="mt-8 flex flex-wrap gap-3">
                      <a href="#contact" className="rounded-full bg-ink px-7 py-3.5 text-sm tracking-wide text-ivory transition hover:bg-bronze">
                        Start your project
                      </a>
                      <a href="#projects" className="rounded-full border border-ink/40 px-7 py-3.5 text-sm tracking-wide text-ink transition hover:border-ink">
                        View projects
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage details: no background. Text colour follows the frame
            (ink on bright scene1, ivory on dark scene2) with a soft shadow for legibility. */}
        <aside
          aria-label="Stage details"
          className="absolute right-8 top-1/2 hidden w-72 -translate-y-1/2 text-right text-ink [text-shadow:0_1px_16px_rgb(0_0_0/0.9)] lg:block xl:right-12 xl:w-80"
        >
          <div className="flex items-baseline justify-end gap-3">
            <p className="eyebrow text-[0.62rem] opacity-70">
              Scene <span ref={chapterRef}>01</span>
            </p>
            <p className="font-serif text-6xl font-light leading-none">
              <span ref={counterRef}>01</span>
              <span className="text-xl opacity-50">/{String(stages.length).padStart(2, "0")}</span>
            </p>
          </div>
          <div className="ml-auto mt-4 h-px w-full bg-current/20">
            <div ref={barRef} className="h-px origin-right scale-x-0 bg-current" />
          </div>

          <div className="relative grid pt-5">
            {stages.map((s, i) => {
              const d = STAGE_DETAILS[i];
              if (!d) return null;
              return (
                <div
                  key={i}
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  data-state={i === 0 ? "current" : "future"}
                  className="col-start-1 row-start-1 translate-y-2 opacity-0 transition duration-500 data-[state=current]:pointer-events-auto data-[state=current]:translate-y-0 data-[state=current]:opacity-100 pointer-events-none"
                >
                  <p className="eyebrow text-[0.62rem] opacity-70">{shortLabel(s.eyebrow)}</p>
                  <p className="mt-1 font-serif text-2xl font-medium leading-tight">{d.service}</p>
                  <ul className="mt-3 space-y-1.5 text-sm font-medium opacity-90">
                    {d.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                  <a href={d.href} className="link-underline mt-5 inline-block pb-0.5 text-sm font-semibold">
                    {d.href === "/contact" ? "Start your project" : "Explore service"} →
                  </a>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Scroll hint */}
        <div ref={hintRef} className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-ink/70">
          <span className="eyebrow text-[0.6rem]">Scroll to design</span>
          <span className="block h-10 w-px animate-pulse bg-ink/50" />
        </div>

        {/* Loader */}
        {pct < 100 && (
          <div className="absolute bottom-6 right-4 md:right-10" aria-live="polite">
            <span className="eyebrow text-[0.6rem] text-ink/60">Loading scene {pct}%</span>
          </div>
        )}
      </div>
    </section>
  );
}
