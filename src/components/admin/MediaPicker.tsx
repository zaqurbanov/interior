"use client";

import { useEffect, useMemo, useState } from "react";
import { listMedia } from "@/app/actions/media";
import type { MediaItem } from "@/lib/types";

/** Modal for reusing an image that is already in the media library. */
export default function MediaPicker({
  multiple,
  exclude = [],
  onSelect,
  onClose,
}: {
  multiple?: boolean;
  /** URLs already in place (shown, but not selectable again). */
  exclude?: string[];
  onSelect: (urls: string[]) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    listMedia().then(setItems, (e) => setError((e as Error).message));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter((m) => !q || m.name.toLowerCase().includes(q) || m.alt.toLowerCase().includes(q));
  }, [items, query]);

  const choose = (url: string) => {
    if (!multiple) return onSelect([url]);
    setPicked((p) => (p.includes(url) ? p.filter((u) => u !== url) : [...p, url]));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Media library" className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-center gap-3 border-b border-black/5 p-4">
          <h2 className="font-medium">Media library</h2>
          <input
            autoFocus
            type="search"
            placeholder="Search by file name or alt text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="field ml-auto max-w-xs py-1.5 text-sm"
          />
          <button type="button" onClick={onClose} className="cursor-pointer px-2 text-xl leading-none text-graphite hover:text-ink" aria-label="Close">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {error && <p className="text-sm text-red-700">{error}</p>}
          {!items && !error && <p className="text-sm text-graphite">Loading…</p>}
          {items && !shown.length && <p className="text-sm text-graphite">No images match.</p>}
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {shown.map((m) => {
              const taken = exclude.includes(m.url);
              const on = picked.includes(m.url);
              return (
                <li key={m.url}>
                  <button
                    type="button"
                    disabled={taken}
                    onClick={() => choose(m.url)}
                    title={m.alt || m.name}
                    className={`group relative block aspect-square w-full cursor-pointer overflow-hidden rounded bg-sand outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
                      on ? "outline outline-2 outline-ink" : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                    {on && <span className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink text-xs text-ivory">{picked.indexOf(m.url) + 1}</span>}
                    {taken && <span className="absolute inset-x-0 bottom-0 bg-white/90 py-0.5 text-[0.65rem]">Already added</span>}
                  </button>
                  <p className="mt-1 truncate text-[0.7rem] text-graphite">{m.name}</p>
                </li>
              );
            })}
          </ul>
        </div>

        {multiple && (
          <div className="flex items-center justify-end gap-3 border-t border-black/5 p-4">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="button" disabled={!picked.length} onClick={() => onSelect(picked)} className="btn">
              Add {picked.length || ""} {picked.length === 1 ? "image" : "images"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
