"use client";

import { useCallback, useState } from "react";
import Lightbox, { type OriginRect } from "./Lightbox";

/** Shared open/close/step state for every gallery layout. */
export function useLightbox(images: string[], title: string, alts?: Record<string, string>) {
  const [open, setOpen] = useState<number | null>(null);
  const [origin, setOrigin] = useState<OriginRect | null>(null);

  const openAt = useCallback((i: number, from?: Element | null) => {
    const rect = from?.getBoundingClientRect();
    setOrigin(rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : null);
    setOpen(i);
  }, []);

  const element =
    open === null ? null : (
      <Lightbox
        images={images}
        title={title}
        alts={alts}
        index={open}
        origin={origin}
        onClose={() => setOpen(null)}
        onStep={(d) => {
          setOrigin(null);
          setOpen((i) => (i === null ? i : (i + d + images.length) % images.length));
        }}
        onJump={(i) => {
          setOrigin(null);
          setOpen(i);
        }}
      />
    );

  return { openAt, element, isOpen: open !== null };
}
