"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SkeletonImage from "./SkeletonImage";
import { useLightbox } from "./use-lightbox";

gsap.registerPlugin(ScrollTrigger);

const PREVIEW = 6;
// Size rhythm: wide, tall, tall, wide, tall, tall — keeps the eye moving.
const SPAN = ["md:col-span-7 aspect-[16/10]", "md:col-span-5 aspect-[4/5]", "md:col-span-5 aspect-[4/5]", "md:col-span-7 aspect-[16/10]", "md:col-span-6 aspect-[4/3]", "md:col-span-6 aspect-[4/3]"];

/** Six selected images on the page; everything else lives in the fullscreen viewer. */
export default function ShowcaseGallery({ images, title, alts }: { images: string[]; title: string; alts?: Record<string, string> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { openAt, element } = useLightbox(images, title, alts);
  const preview = images.slice(0, PREVIEW);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-tile]").forEach((tile) => {
          const img = tile.querySelector("img");
          gsap.fromTo(
            tile,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: { trigger: tile, start: "top 88%", once: true },
            },
          );
          // Slow drift inside the frame: the image moves less than the page.
          if (img) {
            gsap.fromTo(
              img,
              { yPercent: -4 },
              {
                yPercent: 4,
                ease: "none",
                scrollTrigger: { trigger: tile, start: "top bottom", end: "bottom top", scrub: true },
              },
            );
          }
        });
      });
      return () => mm.revert();
    }, rootRef);
    return () => ctx.revert();
  }, [images.length]);

  return (
    <div ref={rootRef} className="container-x">
      <div className="grid gap-4 md:grid-cols-12 md:gap-6">
        {preview.map((src, i) => (
          <button
            key={src}
            type="button"
            data-tile
            onClick={(e) => openAt(i, e.currentTarget)}
            aria-label={`Open image ${i + 1} of ${images.length}`}
            className={`group relative w-full cursor-pointer overflow-hidden bg-sand ${SPAN[i % SPAN.length]}`}
          >
            <SkeletonImage
              src={src}
              alt={alts?.[src] || `${title} — image ${i + 1}`}
              {...(i < 2 ? { priority: true } : {})}
              sizes="(min-width: 768px) 55vw, 92vw"
              className="scale-110 object-cover"
            />
            <span className="eyebrow absolute bottom-4 left-5 text-[0.6rem] text-white/85 [text-shadow:0_1px_10px_rgb(0_0_0/0.8)]">
              {String(i + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>

      {images.length > PREVIEW && (
        <div className="mt-10 flex items-center gap-6">
          <button
            type="button"
            onClick={() => openAt(0, null)}
            className="cursor-pointer rounded-full border border-ink/30 px-7 py-3.5 text-sm tracking-wide transition hover:bg-ink hover:text-ivory"
          >
            View all {images.length} photos
          </button>
          <span className="eyebrow text-[0.62rem] text-graphite">
            {images.length - PREVIEW} more inside
          </span>
        </div>
      )}

      {element}
    </div>
  );
}
