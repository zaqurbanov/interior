"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import SkipArrow from "./SkipArrow";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Stage } from "@/lib/types";
import { drawCover, loadFrame, type Frame } from "@/lib/canvas-frame";
import { SCROLL_SECTION_CLASS, linearOrder, prefersLiteMedia, progressiveOrder, scrollSectionStyle, whenReadyToStream } from "@/lib/frame-loader";
import { createPlayer, createVideoPlayer, type Player } from "@/lib/autoplay";
import { useAutoplayMode, useScrollGate, watchVisibility } from "./use-autoplay";
import ReplayButton from "./ReplayButton";
import { framesUrl } from "@/lib/frames-base";
import {
  HOME_FPS,
  HOME_SEGMENTS,
  HOME_VIDEO,
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
  const [loaded, setLoaded] = useState(0);
  const [lite, setLite] = useState(false);
  // Phones play the sequence by itself instead of scrubbing it (lib/autoplay.ts).
  const autoplay = useAutoplayMode();
  // Phones: the page waits on this section until the arrow is tapped.
  const gate = useScrollGate(sectionRef, autoplay === true && !lite);
  const releaseGate = gate.release;
  const [ended, setEnded] = useState(false);
  const playerRef = useRef<Player | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Phones play an MP4 (far lighter than the frames); frames remain the
  // fallback if the browser will not autoplay it.
  const [videoFailed, setVideoFailed] = useState(false);
  const useVideo = autoplay === true && !videoFailed;

  const starts = STAGE_STARTS.slice(0, stages.length);

  // Stage copy, dots, progress bar and the dark overlay for a timeline position
  // p (0–1). Shared by the scroll, frame-autoplay and video paths; touches only refs.
  const overlays = (p: number) => {
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
    // With autoplay the arrow is the way on to the rest of the page, so it stays.
    if (hintRef.current && !autoplay) hintRef.current.style.opacity = String(1 - clamp01((p - 0.92) / 0.06));
    const dark = clamp01((p - DARK_FROM + FADE) / FADE);
    if (darkRef.current) darkRef.current.style.opacity = String(dark);
    stickyRef.current?.setAttribute("data-dark", String(dark > 0.5));
  };

  // Reduced motion, Data Saver or a very slow connection: a still image instead.
  useEffect(() => setLite(prefersLiteMedia()), []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (lite || autoplay === null || useVideo || !section || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const set: FrameSet = window.innerWidth * Math.min(window.devicePixelRatio, 2) < 1500 ? "mobile" : "desktop";
    const images: (Frame | null)[] = new Array(TOTAL_FRAMES).fill(null);
    const state = { unit: 0 };
    let drawn = -1;
    let raf = 0;
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

    // Load first frame immediately, then the rest in parallel batches.
    let count = 0;
    const load = async (i: number) => {
      const frame = await loadFrame(frameUrl(i, set));
      if (cancelled || !frame) return;
      images[i] = frame;
      count++;
      if (count % 8 === 0 || count === TOTAL_FRAMES) setLoaded(count);
      if (Math.abs(unitToFrame(state.unit) - i) < 3 || drawn === -1) render(true);
    };

    const loadRange = async (from: number, to: number) => {
      // Coarse-to-fine, so the whole scene is scrubbable before it is complete.
      // Playback needs the frames in order instead.
      const queue = (autoplay ? linearOrder : progressiveOrder)(from, to).filter((i) => !images[i]);
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
    const signal = { cancelled: false };
    (async () => {
      // Frame 0 is the server-rendered LCP image, so this comes from cache.
      await load(0);
      resize();
      await whenReadyToStream(section, signal);
      await loadRange(1, SCENE1_FRAMES);
      startScene2();
    })();

    const updateOverlays = (p: number) => {
      overlays(p);
      if (p > SCENE2_PROGRESS * 0.8) startScene2();
    };

    const last = TOTAL_UNITS - 1;
    if (autoplay) {
      const player = createPlayer({
        totalUnits: TOTAL_UNITS,
        fps: HOME_FPS,
        // Slow down once each stage's copy has faded in.
        holds: starts.slice(1).map((s) => Math.round((s + FADE) * last)),
        ready: (u) => Boolean(images[unitToFrame(u)]),
        onUnit: (u) => {
          state.unit = u;
          render();
          updateOverlays(u / last);
          setEnded(false);
        },
        onEnd: () => {
          setEnded(true);
          // Watched to the end: the page scrolls freely again.
          releaseGate();
        },
      });
      playerRef.current = player;
      const stopWatching = watchVisibility(section, (visible) => (visible ? player.play() : player.pause()));
      updateOverlays(0);
      window.addEventListener("resize", resize);
      return () => {
        cancelled = true;
        signal.cancelled = true;
        if (raf) cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        stopWatching();
        player.destroy();
        playerRef.current = null;
      };
    }

    const tween = gsap.to(state, {
      unit: TOTAL_UNITS - 1,
      ease: "none",
      onUpdate: () => render(),
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => updateOverlays(self.progress),
      },
    });
    updateOverlays(0);

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
  }, [stages.length, lite, autoplay, useVideo]);

  // Phones: the MP4 is the clock; its time drives the same stage copy.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (lite || !useVideo || !section || !video) return;
    const last = TOTAL_UNITS - 1;
    const signal = { cancelled: false };
    let player: Player | null = null;
    let stopWatching = () => {};
    const show = () => (video.style.opacity = "1");
    overlays(0);
    whenReadyToStream(section, signal).then(() => {
      if (signal.cancelled) return;
      video.muted = true; // required for autoplay; set as a property, React does not render the attribute
      video.addEventListener("loadeddata", show, { once: true });
      video.src = HOME_VIDEO;
      const p = createVideoPlayer({
        video,
        fps: HOME_FPS,
        segments: HOME_SEGMENTS,
        holds: starts.slice(1).map((s) => Math.round((s + FADE) * last)),
        onUnit: (u) => {
          overlays(u / last);
          setEnded(false);
        },
        onEnd: () => {
          setEnded(true);
          // Watched to the end: the page scrolls freely again.
          releaseGate();
        },
        onFail: () => setVideoFailed(true),
      });
      player = p;
      playerRef.current = p;
      stopWatching = watchVisibility(section, (visible) => (visible ? p.play() : p.pause()));
    });
    return () => {
      signal.cancelled = true;
      stopWatching();
      player?.destroy();
      playerRef.current = null;
      video.removeEventListener("loadeddata", show);
      video.removeAttribute("src");
      video.load();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages.length, lite, useVideo]);

  const pct = Math.round((loaded / TOTAL_FRAMES) * 100);

  // Still version: the finished room and every stage as readable text.
  if (lite) {
    return (
      <section aria-label="From empty room to finished interior" className="relative pt-16 md:pt-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={framesUrl("final.webp")} alt="Finished living room interior" fetchPriority="high" className="aspect-video w-full object-cover" />
        <div className="container-x py-16">
          {stages[0] && (
            <>
              <p className="eyebrow text-bronze">{stages[0].eyebrow}</p>
              <h1 className="mt-4 font-serif text-[clamp(2.6rem,6vw,5rem)] font-light leading-[0.95]">{stages[0].title}</h1>
              <p className="mt-6 max-w-xl text-lg text-graphite">{stages[0].text}</p>
            </>
          )}
          <ol className="mt-16 grid gap-10 md:grid-cols-2">
            {stages.slice(1).map((s) => (
              <li key={s.title}>
                <p className="eyebrow text-bronze">{s.eyebrow}</p>
                <h2 className="mt-3 font-serif text-3xl font-light">{s.title}</h2>
                <p className="mt-3 leading-relaxed text-graphite">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      // The phone contact bar stays out of the way while this is on screen.
      data-walkthrough
      aria-label="From empty room to finished interior and a walk inside"
      className={`relative ${SCROLL_SECTION_CLASS}`}
      style={scrollSectionStyle(SCROLL_VH)}
    >
      <div ref={stickyRef} data-dark="false" className="group sticky top-0 h-svh w-full overflow-hidden bg-sand">
        {/* First frame as real HTML: the page's LCP image, visible before any JS runs. */}
        <picture>
          <source media="(max-width: 767px)" srcSet={frameUrl(0, "mobile")} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frameUrl(0, "desktop")}
            alt="An empty, unfurnished living room before the design"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        {useVideo && (
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300"
          />
        )}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300"
          aria-hidden="true"
        />

        {/* Legibility gradients: light for scene1, dark for scene2 close-ups */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ivory/90 via-ivory/40 to-transparent md:via-ivory/25" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ivory/70 to-transparent md:hidden" />
        <div ref={darkRef} className="pointer-events-none absolute inset-0 opacity-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent md:hidden" />
        </div>

        {/* Stage copy */}
        <div className="container-x relative flex h-full items-end pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:items-center md:pb-0">
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
          <div className="ml-auto h-px w-full bg-current/20">
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
        <div ref={hintRef} className="absolute inset-x-0 bottom-0 flex justify-center">
          <SkipArrow sectionRef={sectionRef} label="Scroll to design" skipLabel="Skip" locked={gate.locked} onSkip={gate.release} />
        </div>

        {autoplay && ended && <ReplayButton onClick={() => playerRef.current?.restart()} />}

        {/* Loader */}
        {pct < 100 && !useVideo && (
          // Top-right on phones, where it cannot collide with the centred arrow.
          <div className="absolute right-4 top-20 md:top-auto md:bottom-6 md:right-10" aria-live="polite">
            <span className="eyebrow text-[0.6rem] text-ink/60">Loading scene {pct}%</span>
          </div>
        )}
      </div>
    </section>
  );
}
