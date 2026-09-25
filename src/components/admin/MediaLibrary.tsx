"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteMedia, saveMediaAlt } from "@/app/actions/media";
import type { MediaItem } from "@/lib/types";
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

function MediaCard({ item }: { item: MediaItem }) {
  const router = useRouter();
  const [alt, setAlt] = useState(item.alt);
  const [status, setStatus] = useState("");
  const [pending, start] = useTransition();
  const dirty = alt.trim() !== item.alt;

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
      if (res.ok) router.refresh();
      else setStatus(res.message);
    });

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-black/5 bg-white">
      <a href={item.url} target="_blank" rel="noreferrer" className="block aspect-[4/3] bg-sand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover" />
      </a>
      <div className="flex flex-1 flex-col gap-3 p-3 text-xs">
        <div>
          <p className="truncate font-medium" title={item.name}>{item.name}</p>
          <p className="text-graphite">
            {[item.width && item.height ? `${item.width} × ${item.height}` : "", item.size ? formatBytes(item.size) : "", item.stored ? "" : "shipped with site"]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-1"
        >
          <label className="label mb-0" htmlFor={`alt-${item.url}`}>Alt text</label>
          <textarea
            id={`alt-${item.url}`}
            rows={2}
            maxLength={300}
            value={alt}
            onChange={(e) => {
              setAlt(e.target.value);
              setStatus("");
            }}
            placeholder="e.g. Marble fireplace in the Belgravia drawing room"
            className="field py-1.5 text-xs"
          />
          <div className="flex items-center gap-2">
            <button disabled={!dirty || pending} className="btn px-2.5 py-1 text-xs">Save</button>
            {status && <span className={status === "Saved" ? "text-green-700" : "text-red-700"}>{status}</span>}
          </div>
        </form>

        <div className="mt-auto">
          {item.usedBy.length ? (
            <ul className="space-y-0.5">
              {item.usedBy.map((u) => (
                <li key={u.label} className="truncate">
                  <Link href={u.href} className="text-bronze hover:underline">{u.label}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-900">Not used</span>
              {item.stored && (
                <button type="button" onClick={remove} disabled={pending} className="cursor-pointer text-red-700 hover:underline disabled:opacity-50">
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default function MediaLibrary({ items, initialFilter = "all" }: { items: MediaItem[]; initialFilter?: Filter }) {
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [query, setQuery] = useState("");

  const counts = {
    all: items.length,
    unused: items.filter((m) => !m.usedBy.length).length,
    "no-alt": items.filter((m) => !m.alt).length,
  };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (m) =>
        (filter === "all" || (filter === "unused" ? !m.usedBy.length : !m.alt)) &&
        (!q || m.name.toLowerCase().includes(q) || m.alt.toLowerCase().includes(q) || m.usedBy.some((u) => u.label.toLowerCase().includes(q))),
    );
  }, [items, filter, query]);

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "no-alt", label: "Missing alt text" },
    { id: "unused", label: "Not used" },
  ];

  return (
    <div className="space-y-6">
      <Uploader />

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition ${
              filter === t.id ? "border-ink bg-ink text-ivory" : "border-black/10 bg-white text-graphite hover:border-black/30 hover:text-ink"
            }`}
          >
            {t.label} <span className="opacity-60">{counts[t.id]}</span>
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

      {shown.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((m) => (
            <MediaCard key={m.url} item={m} />
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-black/5 bg-white p-6 text-sm text-graphite">No images here.</p>
      )}
    </div>
  );
}
