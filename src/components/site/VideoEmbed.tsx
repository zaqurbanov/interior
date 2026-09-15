"use client";

import { useState } from "react";

/** Lightweight YouTube/Vimeo embed: shows a poster and loads the player on click. */
export default function VideoEmbed({ video, title }: { video: string; title: string }) {
  const [provider, id] = video.split(":");
  const [playing, setPlaying] = useState(false);
  if (!id) return null;

  const src =
    provider === "vimeo"
      ? `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`
      : `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  const poster = provider === "youtube" ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      {playing ? (
        <iframe
          src={src}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 grid place-items-center" aria-label={`Play video: ${title}`}>
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-70 transition group-hover:opacity-85" />
          )}
          <span className="relative grid h-20 w-20 place-items-center rounded-full border border-white/60 bg-black/30 text-white backdrop-blur transition group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span className="eyebrow absolute bottom-6 left-6 text-[0.62rem] text-white/80">{title}</span>
        </button>
      )}
    </div>
  );
}
