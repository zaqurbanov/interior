"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import SkipArrow from "./SkipArrow";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { drawCover, loadFrame, type Frame } from "@/lib/canvas-frame";
import { prefersLiteMedia, progressiveOrder, whenReadyToStream } from "@/lib/frame-loader";
import {
  storyFirstFrame,
  storyFrameUrl,
  storyScrollVh,
  storyTimeline,
  storyUnitToFrame,
  type ProjectStory as Story,
} from "@/lib/project-story";

gsap.registerPlugin(ScrollTrigger);

const FADE = 0.035;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Scroll-scrubbed walkthrough of a project, with copy on the left and facts on the right. */
export default function ProjectStory({ story, title }: { story: Story; title: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leftRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(0);
  const [lite, setLite] = useState(false);

  const { totalFrames, totalUnits } = storyTimeline(story);
  const starts = story.stages.map((s) => s.at / totalUnits);
  const first = storyFirstFrame(story);

  // Reduced motion, Data Saver or a very slow connection: a still image instead.
  useEffect(() => setLite(prefersLiteMedia()), []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (lite || !section || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const set = window.innerWidth * Math.min(window.devicePixelRatio, 2) < 1500 ? "mobile" : "desktop";
    const images: (Frame | null)[] = new Array(totalFrames).fill(null);
    const state = { unit: 0 };
    let drawn = -1;
    let raf = 0;
    let cancelled = false;

    const nearestLoaded = (i: number) => {
      for (let d = 0; d < totalFrames; d++) {
        if (images[i - d]) return images[i - d];
        if (images[i + d]) return images[i + d];
      }
      return null;
    };

    const render = (force = false) => {
      const i = storyUnitToFrame(story, state.unit);
      if (!force && i === drawn) return;
      const frame = images[i] ?? nearestLoaded(i);
      if (!frame) return;
      drawn = images[i] ? i : -1;
      // Paint on the next frame so several scroll updates coalesce into one draw.
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        drawCover(ctx, canvas, frame);
        // The server-rendered first frame stays underneath until now.
        canvas.style.opacity = "1";
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      render(true);
    };

    let count = 0;
    const load = async (i: number) => {
      const frame = await loadFrame(storyFrameUrl(story, i, set));
      if (cancelled || !frame) return;
      images[i] = frame;
      count++;
      if (count % 10 === 0 || count === totalFrames) setLoaded(count);
      if (Math.abs(storyUnitToFrame(story, state.unit) - i) < 3 || drawn === -1) render(true);
    };

    const loadRange = async (from: number, to: number) => {
      const queue = progressiveOrder(from, to).filter((i) => !images[i]);
      const workers = Array.from({ length: 6 }, async () => {
        while (queue.length && !cancelled) await load(queue.shift()!);
      });
      await Promise.all(workers);
    };

    const signal = { cancelled: false };
    (async () => {
      // Frame 0 is the server-rendered LCP image, so this comes from cache.
      await load(0);
      resize();
      // Everything else waits until the page itself has loaded (or the visitor
      // is about to reach the section), then streams coarse-to-fine per scene.
      await whenReadyToStream(section, signal);
      let from = 0;
      for (const frames of story.scenes) {
        if (cancelled) break;
        await loadRange(from, from + frames);
        from += frames;
      }
    })();

    const fadeStage = (el: HTMLElement | null, i: number, p: number, offset: number) => {
      if (!el) return;
      const a = starts[i];
      const b = starts[i + 1] ?? 1.01;
      const fadeIn = i === 0 ? 1 : clamp01((p - a) / FADE);
      const fadeOut = i === starts.length - 1 ? 1 : clamp01((b - p) / FADE);
      const o = Math.min(fadeIn, fadeOut);
      el.style.opacity = String(o);
      el.style.transform = `translateY(${(1 - fadeIn) * offset - (1 - fadeOut) * offset}px)`;
      el.setAttribute("aria-hidden", o > 0.5 ? "false" : "true");
    };

    const update = (p: number) => {
      leftRefs.current.forEach((el, i) => fadeStage(el, i, p, 32));
      rightRefs.current.forEach((el, i) => fadeStage(el, i, p, 20));
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (hintRef.current) hintRef.current.style.opacity = String(1 - clamp01((p - 0.92) / 0.06));
    };

    const tween = gsap.to(state, {
      unit: totalUnits - 1,
      ease: "none",
      onUpdate: () => render(),
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => update(self.progress),
      },
    });
    update(0);

    window.addEventListener("resize", resize);
    return () => {
      cancelled = true;
      signal.cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.slug, lite]);

  const pct = Math.round((loaded / totalFrames) * 100);

  // Still version: first frame plus every stage as readable text.
  if (lite) {
    return (
      <section aria-label={`${title} — walkthrough`} className="relative">
        <picture>
          <source media="(max-width: 767px)" srcSet={first.mobile} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={first.desktop} alt={`${title} — ${story.stages[0]?.title ?? "walkthrough"}`} className="aspect-video w-full object-cover" />
        </picture>
        <ol className="container-x grid gap-10 py-16 md:grid-cols-2">
          {story.stages.map((s) => (
            <li key={s.title}>
              <p className="eyebrow text-bronze">{s.eyebrow}</p>
              <h3 className="mt-3 font-serif text-3xl font-light">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-graphite">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-label={`${title} — walkthrough`}
      className="relative"
      style={{ height: `${storyScrollVh(story)}vh` }}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-sand">
        {/* First frame as real HTML: the page's LCP image, visible before any JS runs. */}
        <picture>
          <source media="(max-width: 767px)" srcSet={first.mobile} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={first.desktop}
            alt={`${title} — ${story.stages[0]?.title ?? "walkthrough"}`}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300"
          aria-hidden="true"
        />

        {/* Legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/20 to-black/75" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent lg:hidden" />

        <div className="container-x relative flex h-full items-end pb-[12vh] lg:items-center lg:pb-0">
          <div className="grid w-full gap-8 lg:grid-cols-12">
            {/* Left: stage copy */}
            <div className="relative lg:col-span-6">
              {story.stages.map((s, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    leftRefs.current[i] = el;
                  }}
                  className={`${i === 0 ? "relative" : "absolute inset-x-0 bottom-0 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"} text-ink will-change-transform`}
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <p className="eyebrow text-bronze">{s.eyebrow}</p>
                  <h3 className="mt-4 font-serif text-[clamp(2rem,4.4vw,3.8rem)] font-light leading-[1.02]">{s.title}</h3>
                  <p className="mt-5 max-w-lg leading-relaxed text-ink/75">{s.text}</p>
                </div>
              ))}
            </div>

            {/* Right: facts */}
            <div className="relative hidden lg:col-span-4 lg:col-start-9 lg:block">
              {story.stages.map((s, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    rightRefs.current[i] = el;
                  }}
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-right text-ink will-change-transform"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <p className="eyebrow text-[0.62rem] text-ink/60">{s.label}</p>
                  <ul className="mt-4 space-y-2 text-sm font-medium">
                    {s.facts.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-ink/15">
          <div ref={barRef} className="h-px origin-left scale-x-0 bg-bronze" />
        </div>

        <div ref={hintRef} className="absolute inset-x-0 bottom-0 flex justify-center">
          <SkipArrow sectionRef={sectionRef} label="Scroll to walk through" skipLabel="Skip" />
        </div>

        {pct < 100 && (
          <div className="absolute bottom-6 right-4 md:right-10" aria-live="polite">
            <span className="eyebrow text-[0.6rem] text-ink/60">Loading walkthrough {pct}%</span>
          </div>
        )}
      </div>
    </section>
  );
}
