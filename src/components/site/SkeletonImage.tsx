"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * next/image (fill) with a branded, animated skeleton: a blueprint-style grid,
 * a faint VF monogram and a sweeping shimmer. The image fades in once decoded.
 */
export default function SkeletonImage({ className = "", onLoad, ...props }: Omit<ImageProps, "fill"> & { className?: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <div
        aria-hidden="true"
        className={`skeleton absolute inset-0 transition-opacity duration-700 ${loaded ? "opacity-0" : "opacity-100"}`}
      >
        <div className="skeleton-grid absolute inset-0" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3">
            <span className="skeleton-mark font-serif text-3xl font-light tracking-tight text-white/15 md:text-4xl">VF</span>
            <span className="h-px w-16 overflow-hidden bg-white/10">
              <span className="skeleton-line block h-full w-1/2 bg-bronze/70" />
            </span>
          </div>
        </div>
        <div className="skeleton-shimmer absolute inset-0" />
      </div>
      <Image
        {...props}
        fill
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={`${className} transition-[opacity,transform] duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
