"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  storyFrameUrl,
  storyPosterUrl,
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

  const { totalFrames, totalUnits } = storyTimeline(story);
  const starts = story.stages.map((s) => s.at / totalUnits);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const set = window.innerWidth * Math.min(window.devicePixelRatio, 2) < 1500 ? "mobile" : "desktop";
    const images: (HTMLImageElement | null)[] = new Array(totalFrames).fill(null);
    const state = { unit: 0 };
    let drawn = -1;
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
      const img = nearestLoaded(i);
      if (!img) return;
      drawn = images[i] ? i : -1;
      const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      render(true);
    };

    let count = 0;
    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (cancelled) return resolve();
          images[i] = img;
          count++;
          if (count % 10 === 0 || count === totalFrames) setLoaded(count);
          if (Math.abs(storyUnitToFrame(story, state.unit) - i) < 3 || drawn === -1) render(true);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = storyFrameUrl(story, i, set);
      });

    const loadRange = async (from: number, to: number) => {
      const queue = Array.from({ length: to - from }, (_, k) => from + k);
      const workers = Array.from({ length: 6 }, async () => {
        while (queue.length && !cancelled) await load(queue.shift()!);
      });
      await Promise.all(workers);
    };

    (async () => {
      await load(0);
      resize();
      // Scene by scene, so the first part is playable while the rest downloads.
      let from = 0;
      for (const frames of story.scenes) {
        if (cancelled) break;
        await loadRange(from === 0 ? 1 : from, from + frames);
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
      if (hintRef.current) hintRef.current.style.opacity = String(1 - clamp01(p / 0.02));
    };

    const tween = gsap.to(state, {
      unit: totalUnits - 1,
      ease: "none",
      onUpdate: () => render(),
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => update(self.progress),
      },
    });
    update(0);

    window.addEventListener("resize", resize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.slug]);

  const pct = Math.round((loaded / totalFrames) * 100);

  return (
    <section
      ref={sectionRef}
      aria-label={`${title} — walkthrough`}
      className="relative"
      style={{ height: `${story.scrollVh}vh` }}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-sand">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={storyPosterUrl(story)} alt={`${title} walkthrough`} className="absolute inset-0 h-full w-full object-cover" />
        </noscript>

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

        <div ref={hintRef} className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-ink/70">
          <span className="eyebrow text-[0.6rem]">Scroll to walk through</span>
          <span className="block h-8 w-px animate-pulse bg-ink/50" />
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
