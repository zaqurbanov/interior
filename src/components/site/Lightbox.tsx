"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import SkeletonImage from "./SkeletonImage";

export type OriginRect = { top: number; left: number; width: number; height: number };

/**
 * Fullscreen viewer: thumbnail rail, keyboard and swipe navigation. When the
 * caller passes the rect of the thumbnail that was clicked, the view grows out
 * of it (and shrinks back on close) — a FLIP transition with a uniform scale,
 * so nothing stretches.
 */
export default function Lightbox({
  images,
  title,
  index,
  origin,
  onClose,
  onStep,
  onJump,
}: {
  images: string[];
  title: string;
  index: number;
  origin?: OriginRect | null;
  onClose: () => void;
  onStep: (delta: number) => void;
  onJump?: (index: number) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const fallback = useRef(0);
  const drag = useRef({ active: false, startX: 0, dx: 0 });
  const glassRef = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);
  const rail = useRef({ active: false, startX: 0, scrollLeft: 0, moved: 0 });
  const [zoom, setZoom] = useState(false);

  const reduced = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Transform that maps the frame onto `origin` (uniform scale, centre to centre). */
  const originTransform = (frame: HTMLElement) => {
    if (!origin) return null;
    const to = frame.getBoundingClientRect();
    if (!to.width || !to.height) return null;
    const scale = Math.max(origin.width / to.width, origin.height / to.height);
    return {
      x: origin.left + origin.width / 2 - (to.left + to.width / 2),
      y: origin.top + origin.height / 2 - (to.top + to.height / 2),
      scale,
    };
  };

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const from = reduced() || document.hidden ? null : originTransform(frame);
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
    gsap.fromTo(railRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: "power3.out" });
    if (!from) {
      gsap.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
      return;
    }
    gsap.fromTo(frame, { ...from, opacity: 0.6 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.6, ease: "power3.inOut" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(() => {
    const frame = frameRef.current;
    if (closing.current) return;
    closing.current = true;
    // A background tab pauses GSAP's ticker, so never rely on onComplete alone.
    const done = () => {
      window.clearTimeout(fallback.current);
      onClose();
    };
    const to = frame && !reduced() && !document.hidden ? originTransform(frame) : null;
    gsap.to([backdropRef.current, railRef.current], { opacity: 0, duration: 0.3, ease: "power2.in" });
    if (!frame || !to) return done();
    gsap.to(frame, { ...to, opacity: 0, duration: 0.45, ease: "power3.inOut", onComplete: done });
    fallback.current = window.setTimeout(done, 700);
  }, [onClose, origin]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      window.clearTimeout(fallback.current);
      cancelAnimationFrame(raf.current);
    };
  }, [close, onStep]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    railRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [index]);

  const jump = (i: number) => (onJump ? onJump(i) : onStep(i - index));

  /**
   * Grab anywhere on the thumbnail rail to drag it sideways. Deliberately no
   * setPointerCapture: capturing would redirect the following click to the rail
   * itself, and clicking a thumbnail would stop selecting that image.
   */
  const railDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = railRef.current;
    if (!el) return;
    rail.current = { active: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: 0 };

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - rail.current.startX;
      rail.current.moved = Math.max(rail.current.moved, Math.abs(dx));
      el.scrollLeft = rail.current.scrollLeft - dx;
    };
    const up = () => {
      rail.current.active = false;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      // Clear the guard after the click that follows this release.
      window.setTimeout(() => (rail.current.moved = 0), 0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  /** Magnifier: follows the mouse over the image, so renders can be inspected. */
  const LOUPE = 210;
  const ZOOM = 2.6;

  const moveLoupe = (e: React.PointerEvent<HTMLDivElement>) => {
    const glass = glassRef.current;
    const img = frameRef.current?.querySelector("img");
    if (!glass || !img) return;
    if (!zoom || e.pointerType !== "mouse" || drag.current.active) {
      glass.style.opacity = "0";
      return;
    }
    const box = img.getBoundingClientRect();
    // object-contain: work out where the picture actually sits inside the box.
    const scale = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const left = box.left + (box.width - w) / 2;
    const top = box.top + (box.height - h) / 2;
    const x = e.clientX - left;
    const y = e.clientY - top;
    if (x < 0 || y < 0 || x > w || y > h) {
      glass.style.opacity = "0";
      return;
    }
    glass.style.opacity = "1";
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      glass.style.transform = `translate3d(${e.clientX - LOUPE / 2}px, ${e.clientY - LOUPE / 2}px, 0)`;
      glass.style.backgroundSize = `${w * ZOOM}px ${h * ZOOM}px`;
      glass.style.backgroundPosition = `${-(x * ZOOM - LOUPE / 2)}px ${-(y * ZOOM - LOUPE / 2)}px`;
    });
  };

  useEffect(() => {
    if (!zoom) hideLoupe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, index]);

  const hideLoupe = () => {
    cancelAnimationFrame(raf.current);
    if (glassRef.current) glassRef.current.style.opacity = "0";
  };

  // Grab and drag the image (mouse or finger) to move through the gallery.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    drag.current = { active: true, startX: e.clientX, dx: 0 };
    hideLoupe();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.dx = e.clientX - drag.current.startX;
    // The image trails the finger a little, so the gesture feels physical.
    gsap.set(frameRef.current, { x: drag.current.dx * 0.35 });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const { dx } = drag.current;
    drag.current.active = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    gsap.to(frameRef.current, { x: 0, duration: 0.4, ease: "power3.out" });
    if (Math.abs(dx) > 70) onStep(dx < 0 ? 1 : -1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} gallery`}
      className="fixed inset-0 z-[70]"
      onClick={() => {
        // A drag should not count as a click on the backdrop.
        if (Math.abs(drag.current.dx) < 6) close();
      }}
    >
      <div ref={backdropRef} className="absolute inset-0 bg-black/95" />

      <div
        ref={frameRef}
        className={`absolute inset-x-4 top-16 bottom-36 touch-pan-y select-none will-change-transform active:cursor-grabbing md:inset-x-16 md:top-20 md:bottom-40 ${
          zoom ? "cursor-zoom-in" : "cursor-grab"
        }`}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => {
          onPointerMove(e);
          moveLoupe(e);
        }}
        onPointerLeave={hideLoupe}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDragStart={(e) => e.preventDefault()}
      >
        <SkeletonImage key={images[index]} src={images[index]} alt={`${title} — image ${index + 1}`} sizes="100vw" className="object-contain" priority />
      </div>

      <p className="eyebrow absolute left-4 top-5 text-[0.62rem] text-white/70 md:left-8">
        {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
      </p>
      <p className="eyebrow absolute left-1/2 top-5 hidden -translate-x-1/2 text-[0.62rem] text-white/50 md:block">{title}</p>
      <button type="button" onClick={close} className="absolute right-4 top-3 cursor-pointer p-2 text-3xl leading-none text-white md:right-8" aria-label="Close">×</button>

      <button type="button" onClick={(e) => { e.stopPropagation(); onStep(-1); }} className="absolute left-1 top-1/2 -translate-y-1/2 cursor-pointer p-4 text-3xl text-white/70 transition hover:text-white md:left-4" aria-label="Previous image">‹</button>
      <button type="button" onClick={(e) => { e.stopPropagation(); onStep(1); }} className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer p-4 text-3xl text-white/70 transition hover:text-white md:right-4" aria-label="Next image">›</button>

      {/* Zoom toggle on the image */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setZoom((v) => !v);
        }}
        data-on={zoom}
        aria-pressed={zoom}
        aria-label={zoom ? "Turn the magnifier off" : "Magnify this image"}
        className="zoom-halo group absolute bottom-40 right-6 z-[72] grid h-14 w-14 cursor-pointer place-items-center rounded-full border border-bronze/70 bg-black/45 text-white shadow-[0_10px_30px_-8px_rgb(0_0_0/0.8)] backdrop-blur-[2px] transition-colors duration-300 hover:bg-bronze hover:text-black data-[on=true]:border-bronze data-[on=true]:bg-bronze data-[on=true]:text-black md:bottom-44 md:right-10 md:h-16 md:w-16"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-6 w-6 md:h-7 md:w-7" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m15.5 15.5 5 5" strokeLinecap="round" />
          <path d="M10.5 7.5v6M7.5 10.5h6" strokeLinecap="round" className="group-data-[on=true]:hidden" />
          <path d="M7.5 10.5h6" strokeLinecap="round" className="hidden group-data-[on=true]:block" />
        </svg>
        <span className="eyebrow pointer-events-none absolute -top-7 right-0 whitespace-nowrap text-[0.55rem] text-white/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {zoom ? "Zoom on" : "Zoom"}
        </span>
      </button>

      {/* Magnifier */}
      <span
        ref={glassRef}
        aria-hidden="true"
        style={{ width: LOUPE, height: LOUPE, backgroundImage: `url(${images[index]})`, opacity: 0 }}
        className="pointer-events-none fixed left-0 top-0 z-[71] rounded-full border border-white/40 bg-no-repeat shadow-[0_20px_60px_-15px_rgb(0_0_0/0.8)] transition-opacity duration-150"
      />

      {/* Thumbnail rail */}
      <div
        ref={railRef}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={railDown}
        onDragStart={(e) => e.preventDefault()}
        className="no-scrollbar absolute inset-x-0 bottom-0 flex cursor-grab touch-pan-x select-none gap-2 overflow-x-auto px-4 pb-6 pt-3 active:cursor-grabbing md:gap-3 md:px-8"
      >
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            data-active={i === index}
            onClick={() => {
              // A drag across the rail should not select a thumbnail.
              if (rail.current.moved > 6) return;
              jump(i);
            }}
            aria-label={`Go to image ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            className="relative h-16 w-24 shrink-0 cursor-pointer overflow-hidden opacity-40 outline-offset-2 transition-opacity duration-300 hover:opacity-80 data-[active=true]:opacity-100 md:h-20 md:w-32"
          >
            <SkeletonImage src={src} alt="" sizes="128px" className="object-cover" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px scale-x-0 bg-bronze transition-transform duration-300 group-data-[active=true]:scale-x-100" />
          </button>
        ))}
      </div>
    </div>
  );
}
