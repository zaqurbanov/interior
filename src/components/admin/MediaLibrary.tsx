"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { deleteMedia, saveMediaAlt } from "@/app/actions/media";
import type { MediaItem, MediaKind } from "@/lib/types";
import { formatBytes } from "@/lib/upload-config";
import { uploadImage } from "@/lib/upload-client";
import { DropTarget, Progress } from "./ImageUpload";

export type Filter = "all" | "unused" | "no-alt";

function Uploader() {
  const router = useRouter();
  const [jobs, setJobs] = useState<{ id: number; name: string; progress: number; error?: string }[]>([]);

  async function start(files: File[]) {
    const base = Date.now();
    const list = files.map((f, i) => ({ id: base + i, name: f.name, progress: 0 }));
    setJobs((j) => [...j, ...list]);
    for (const [i, file] of files.entries()) {
      const id = list[i].id;
      try {
        await uploadImage(file, { onProgress: (p) => setJobs((j) => j.map((x) => (x.id === id ? { ...x, progress: p } : x))) });
        setJobs((j) => j.filter((x) => x.id !== id));
      } catch (e) {
        setJobs((j) => j.map((x) => (x.id === id ? { ...x, error: (e as Error).message } : x)));
      }
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <DropTarget multiple onFiles={start} className="rounded-lg border border-dashed border-black/15 bg-white px-4 py-6 text-center">
        <p className="text-sm">Drop images here or click to upload</p>
        <p className="mt-1 text-xs text-graphite">They go into the library; pick them from any project, service or content image.</p>
      </DropTarget>
      {jobs.map((j) => (
        <div key={j.id} className="relative flex items-center gap-3 rounded border border-black/5 bg-white px-3 py-2 pb-4 text-xs">
          <span className="truncate">{j.name}</span>
          {j.error ? (
            <>
              <span className="text-red-700">{j.error}</span>
              <button type="button" className="ml-auto cursor-pointer text-graphite hover:text-ink" onClick={() => setJobs((l) => l.filter((x) => x.id !== j.id))}>
                Dismiss
              </button>
            </>
          ) : (
            <Progress value={j.progress} />
          )}
        </div>
      ))}
    </div>
  );
}


/** Side panel for one image: preview, alt text, where it is used, delete. */
function MediaPanel({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const router = useRouter();
  const [alt, setAlt] = useState(item.alt);
  const [status, setStatus] = useState("");
  const [pending, start] = useTransition();
  const dirty = alt.trim() !== item.alt;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = () =>
    start(async () => {
      const res = await saveMediaAlt(item.url, alt).catch((e: Error) => ({ ok: false, message: e.message }));
      setStatus(res.message);
      if (res.ok) router.refresh();
    });

  const remove = () =>
    confirm("Delete this image permanently?") &&
    start(async () => {
      const res = await deleteMedia(item.url).catch((e: Error) => ({ ok: false, message: e.message }));
      if (res.ok) {
        onClose();
        router.refresh();
      } else setStatus(res.message);
    });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-black/5 p-4">
          <p className="truncate text-sm font-medium" title={item.name}>{item.name}</p>
          <button type="button" onClick={onClose} className="cursor-pointer px-2 text-2xl leading-none text-graphite hover:text-ink" aria-label="Close" autoFocus>×</button>
        </div>
        <a href={item.url} target="_blank" rel="noreferrer" className="block bg-sand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.url} alt="" className="max-h-80 w-full object-contain" />
        </a>
        <div className="space-y-5 p-4 text-sm">
          <p className="text-xs text-graphite">
            {[item.width && item.height ? `${item.width} × ${item.height}` : "", item.size ? formatBytes(item.size) : "", item.stored ? "" : "shipped with site"]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            className="space-y-2"
          >
            <label className="label mb-0" htmlFor="media-alt">Alt text</label>
            <textarea
              id="media-alt"
              rows={3}
              maxLength={300}
              value={alt}
              onChange={(e) => {
                setAlt(e.target.value);
                setStatus("");
              }}
              placeholder="e.g. Marble fireplace in the Belgravia drawing room"
              className="field text-sm"
            />
            <p className="text-xs text-graphite">Describes the image for Google and screen readers, wherever it appears.</p>
            <div className="flex items-center gap-2">
              <button disabled={!dirty || pending} className="btn px-3 py-1.5 text-xs">Save</button>
              {status && <span className={`text-xs ${status === "Saved" ? "text-green-700" : "text-red-700"}`}>{status}</span>}
            </div>
          </form>
          <div>
            <p className="label">Used in</p>
            {item.usedBy.length ? (
              <ul className="space-y-1">
                {item.usedBy.map((u) => (
                  <li key={u.label}>
                    <Link href={u.href} className="text-bronze hover:underline">{u.label}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900">Not used anywhere</span>
                {item.stored && (
                  <button type="button" onClick={remove} disabled={pending} className="cursor-pointer text-xs text-red-700 hover:underline disabled:opacity-50">
                    Delete image
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

/** A compact tile; opens the side panel. */
function Tile({ item, onOpen }: { item: MediaItem; onOpen: (m: MediaItem) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(item)}
        title={item.alt || item.name}
        className="group relative block aspect-square w-full cursor-pointer overflow-hidden rounded-md bg-sand ring-bronze focus-visible:ring-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={item.alt} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        {!item.alt && <span className="absolute left-1.5 top-1.5 rounded bg-amber-100 px-1 text-[0.6rem] font-medium text-amber-900">no alt</span>}
        {!item.usedBy.length && <span className="absolute right-1.5 top-1.5 rounded bg-white/90 px-1 text-[0.6rem] text-graphite">unused</span>}
      </button>
    </li>
  );
}

const PAGE = 24;

function TileGrid({ items, onOpen }: { items: MediaItem[]; onOpen: (m: MediaItem) => void }) {
  const [limit, setLimit] = useState(PAGE);
  return (
    <>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
        {items.slice(0, limit).map((m) => (
          <Tile key={m.url} item={m} onOpen={onOpen} />
        ))}
      </ul>
      {items.length > limit && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE * 2)} className="mt-3 cursor-pointer text-xs text-bronze hover:underline">
          Show more ({items.length - limit} left)
        </button>
      )}
    </>
  );
}

/** A folder per project / service / article: closed by default, so the page stays short. */
function Group({ title, items, onOpen, open }: { title: string; items: MediaItem[]; onOpen: (m: MediaItem) => void; open?: boolean }) {
  const noAlt = items.filter((m) => !m.alt).length;
  return (
    <details open={open} className="group rounded-lg border border-black/5 bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-3 text-sm">
        <span className="text-graphite transition group-open:rotate-90" aria-hidden="true">›</span>
        <span className="flex -space-x-2">
          {items.slice(0, 3).map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.url} src={m.url} alt="" loading="lazy" className="h-8 w-8 rounded border-2 border-white object-cover" />
          ))}
        </span>
        <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
        {noAlt > 0 && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900">{noAlt} no alt</span>}
        <span className="text-xs text-graphite">{items.length}</span>
      </summary>
      <div className="border-t border-black/5 p-3">
        <TileGrid items={items} onOpen={onOpen} />
      </div>
    </details>
  );
}

type View = "projects" | "services" | "journal" | "site" | "all" | Filter;

const KIND_OF: Partial<Record<View, MediaKind[]>> = {
  projects: ["project"],
  services: ["service"],
  journal: ["article"],
  site: ["site"],
};

/** Images grouped by the project / service / article that uses them (an image can sit in several). */
function groupBy(items: MediaItem[], kinds: MediaKind[]) {
  const groups = new Map<string, MediaItem[]>();
  for (const m of items) {
    for (const owner of new Set(m.usedBy.filter((u) => kinds.includes(u.kind)).map((u) => u.owner))) {
      groups.set(owner, [...(groups.get(owner) ?? []), m]);
    }
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export default function MediaLibrary({ items, initialFilter = "all" }: { items: MediaItem[]; initialFilter?: Filter }) {
  const [view, setView] = useState<View>(initialFilter === "all" ? "projects" : initialFilter);
  const [query, setQuery] = useState("");
  const [openItem, setOpenItem] = useState<MediaItem | null>(null);
  const close = useCallback(() => setOpenItem(null), []);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) => m.name.toLowerCase().includes(q) || m.alt.toLowerCase().includes(q) || m.usedBy.some((u) => u.label.toLowerCase().includes(q)));
  }, [items, query]);

  const uses = (m: MediaItem, kinds: MediaKind[]) => m.usedBy.some((u) => kinds.includes(u.kind));
  const tabs: { id: View; label: string; count: number }[] = [
    { id: "projects", label: "Projects", count: items.filter((m) => uses(m, ["project"])).length },
    { id: "services", label: "Services", count: items.filter((m) => uses(m, ["service"])).length },
    { id: "journal", label: "Journal", count: items.filter((m) => uses(m, ["article"])).length },
    { id: "site", label: "Site & team", count: items.filter((m) => uses(m, ["site"])).length },
    { id: "unused", label: "Not used", count: items.filter((m) => !m.usedBy.length).length },
    { id: "no-alt", label: "Missing alt text", count: items.filter((m) => !m.alt).length },
    { id: "all", label: "All", count: items.length },
  ];

  const kinds = KIND_OF[view];
  const flat = view === "unused" ? searched.filter((m) => !m.usedBy.length) : view === "no-alt" ? searched.filter((m) => !m.alt) : searched;
  const groups = kinds ? groupBy(searched, kinds) : [];

  return (
    <div className="space-y-6">
      <Uploader />

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setView(t.id)}
            aria-pressed={view === t.id}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition ${
              view === t.id ? "border-ink bg-ink text-ivory" : "border-black/10 bg-white text-graphite hover:border-black/30 hover:text-ink"
            }`}
          >
            {t.label} <span className="opacity-60">{t.count}</span>
          </button>
        ))}
        <input
          type="search"
          placeholder="Search name, alt text or project"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="field ml-auto max-w-xs py-1.5 text-sm"
        />
      </div>

      {kinds ? (
        groups.length ? (
          <div className="space-y-2">
            {groups.map(([owner, list]) => (
              // Searching opens the folders that match.
              <Group key={owner + (query ? ":q" : "")} title={owner} items={list} onOpen={setOpenItem} open={Boolean(query) || groups.length === 1} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-black/5 bg-white p-6 text-sm text-graphite">No images here.</p>
        )
      ) : flat.length ? (
        <TileGrid key={view + query} items={flat} onOpen={setOpenItem} />
      ) : (
        <p className="rounded-lg border border-black/5 bg-white p-6 text-sm text-graphite">No images here.</p>
      )}

      {openItem && <MediaPanel key={openItem.url} item={items.find((m) => m.url === openItem.url) ?? openItem} onClose={close} />}
    </div>
  );
}
