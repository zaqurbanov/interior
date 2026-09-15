"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, close, step]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {images.map((src, i) => (
          <li key={src} className={i % 5 === 0 ? "col-span-2" : ""}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className={`reveal group relative block w-full overflow-hidden bg-sand ${i % 5 === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`}
              aria-label={`Open image ${i + 1} of ${images.length}`}
            >
              <Image
                src={src}
                alt={`${title} — image ${i + 1}`}
                fill
                sizes={i % 5 === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 50vw"}
                className="object-cover transition duration-700 group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label={`${title} gallery`} className="fixed inset-0 z-[70] bg-black/95" onClick={close}>
          <div className="absolute inset-4 md:inset-16" onClick={(e) => e.stopPropagation()}>
            <Image src={images[open]} alt={`${title} — image ${open + 1}`} fill sizes="100vw" className="object-contain" priority />
          </div>
          <p className="eyebrow absolute left-4 top-4 text-[0.62rem] text-white/70 md:left-8 md:top-6">
            {open + 1} / {images.length}
          </p>
          <button type="button" onClick={close} className="absolute right-4 top-3 p-2 text-3xl leading-none text-white md:right-8" aria-label="Close">×</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute left-2 top-1/2 -translate-y-1/2 p-4 text-3xl text-white md:left-6" aria-label="Previous image">‹</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-4 text-3xl text-white md:right-6" aria-label="Next image">›</button>
        </div>
      )}
    </>
  );
}
