"use client";

import { useId, useRef, useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IMAGE_ACCEPT, MAX_IMAGE_EDGE } from "@/lib/upload-config";
import { uploadImage, type PrepareOptions } from "@/lib/upload-client";
import { useNotifyChange } from "./fields";
import MediaPicker from "./MediaPicker";

// Image inputs for admin forms. Files upload as soon as they are chosen (straight
// to storage, see lib/upload-client.ts); the form itself only carries the
// resulting URLs in hidden inputs. While an upload runs the wrapper carries
// data-uploading, which submitWith() checks before saving.

const CONCURRENCY = 3;
let uid = 0;
const key = () => `u${uid++}`;

const imagesOnly = (list: FileList | null | undefined) => Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));

/** Drag-and-drop target; click to browse. */
export function DropTarget({
  multiple,
  onFiles,
  className = "",
  children,
}: {
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), input.current?.click())}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const files = imagesOnly(e.dataTransfer.files);
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
      }}
      className={`cursor-pointer transition ${over ? "border-bronze bg-bronze/5" : ""} ${className}`}
    >
      {children}
      <input
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = imagesOnly(e.target.files);
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </div>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="absolute inset-x-2 bottom-2 h-1.5 overflow-hidden rounded-full bg-white/70">
      <div className="h-full bg-ink transition-[width]" style={{ width: `${Math.max(4, value)}%` }} />
    </div>
  );
}

const LinkButton = ({ onClick, children, danger }: { onClick: () => void; children: React.ReactNode; danger?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    className={`cursor-pointer text-xs underline-offset-2 hover:underline ${danger ? "text-red-700" : "text-graphite hover:text-ink"}`}
  >
    {children}
  </button>
);

/* ---------------- Single image ---------------- */

export function ImageField({
  name,
  defaultValue = "",
  aspect = "aspect-[4/3]",
  compact,
  removable,
  hint,
  prepare,
}: {
  name: string;
  defaultValue?: string;
  /** Tailwind aspect class for the preview box. */
  aspect?: string;
  /** Small layout (team photos). */
  compact?: boolean;
  removable?: boolean;
  hint?: string;
  prepare?: PrepareOptions;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [job, setJob] = useState<{ preview: string; progress: number } | null>(null);
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);

  async function start(file: File) {
    setError("");
    const preview = URL.createObjectURL(file);
    setJob({ preview, progress: 0 });
    try {
      const done = await uploadImage(file, { ...prepare, onProgress: (p) => setJob((j) => j && { ...j, progress: p }) });
      setUrl(done.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setJob(null);
      URL.revokeObjectURL(preview);
    }
  }

  const shown = job?.preview || url;
  const notify = useNotifyChange(url);

  return (
    <div data-uploading={job ? "true" : undefined} className="space-y-2">
      <input ref={notify} type="hidden" name={name} value={url} />
      <DropTarget
        onFiles={(f) => start(f[0])}
        className={`relative block w-full overflow-hidden rounded border border-dashed border-black/15 bg-sand ${aspect}`}
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className={`h-full w-full object-cover ${job ? "opacity-60" : ""}`} />
        ) : (
          <span className={`absolute inset-0 grid place-items-center p-2 text-center text-graphite ${compact ? "text-[0.65rem]" : "text-sm"}`}>
            {compact ? "Drop photo" : "Drop an image here or click to browse"}
          </span>
        )}
        {job && <Progress value={job.progress} />}
      </DropTarget>
      <div className={`flex flex-wrap gap-x-3 gap-y-1 ${compact ? "justify-center" : ""}`}>
        <LinkButton onClick={() => setPicking(true)}>{compact ? "Library" : "Choose from library"}</LinkButton>
        {removable && url && !job && (
          <LinkButton danger onClick={() => setUrl("")}>Remove</LinkButton>
        )}
      </div>
      {error ? <p className="text-xs text-red-700">{error}</p> : hint && <p className="text-xs text-graphite">{hint}</p>}
      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onSelect={([picked]) => {
            setUrl(picked);
            setError("");
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Gallery ---------------- */

type Tile = { key: string; url: string; preview?: string; progress?: number; error?: string };

const MAX_HIGHLIGHTS = 6;

function GalleryTile({
  tile,
  starred,
  canStar,
  onStar,
  onRemove,
}: {
  tile: Tile;
  starred: boolean;
  canStar: boolean;
  onStar: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tile.key, disabled: !tile.url });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative aspect-square touch-none overflow-hidden rounded bg-sand ${tile.url ? "cursor-grab active:cursor-grabbing" : ""} ${
        isDragging ? "z-10 opacity-80 shadow-lg" : ""
      } ${starred ? "ring-2 ring-bronze ring-offset-2" : ""}`}
      {...attributes}
      {...listeners}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={tile.url || tile.preview} alt="" draggable={false} className={`h-full w-full object-cover ${tile.url ? "" : "opacity-60"}`} />
      {!tile.url && !tile.error && <Progress value={tile.progress ?? 0} />}
      {tile.error && (
        <p className="absolute inset-0 overflow-y-auto bg-red-50/95 p-2 pt-8 text-[0.7rem] leading-snug text-red-800">{tile.error}</p>
      )}
      {tile.url && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onStar}
          disabled={!starred && !canStar}
          aria-pressed={starred}
          title={starred ? "Shown on the page — click to unpick" : canStar ? "Show on the page" : `Six highlights already picked`}
          className={`absolute left-1 top-1 grid h-7 w-7 cursor-pointer place-items-center rounded-full text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
            starred ? "bg-bronze text-white" : "bg-white/90 text-graphite hover:text-ink"
          }`}
        >
          {starred ? "★" : "☆"}
        </button>
      )}
      {(tile.url || tile.error) && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onRemove}
          className="absolute right-1 top-1 cursor-pointer rounded bg-white/90 px-2 py-0.5 text-xs text-red-700"
        >
          {tile.error ? "Dismiss" : "Remove"}
        </button>
      )}
    </li>
  );
}

export function GalleryField({
  name,
  defaultValue = [],
  highlightsName,
  defaultHighlights = [],
  prepare,
}: {
  name: string;
  defaultValue?: string[];
  /** Enables the star picker; starred URLs are posted under this name. */
  highlightsName?: string;
  defaultHighlights?: string[];
  prepare?: PrepareOptions;
}) {
  const [tiles, setTiles] = useState<Tile[]>(() => defaultValue.map((url) => ({ key: key(), url })));
  const [highlights, setHighlights] = useState<string[]>(() => defaultHighlights.filter((h) => defaultValue.includes(h)));
  const [picking, setPicking] = useState(false);
  const busy = tiles.some((t) => !t.url && !t.error);
  const notify = useNotifyChange([tiles.map((t) => t.url).join("|"), highlights.join("|")].join("#"));
  const dndId = useId(); // stable ids for dnd-kit's aria attributes across SSR and hydration
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const patch = (k: string, p: Partial<Tile>) => setTiles((l) => l.map((t) => (t.key === k ? { ...t, ...p } : t)));
  const drop = (k: string) =>
    setTiles((l) => {
      const t = l.find((x) => x.key === k);
      if (t?.preview) URL.revokeObjectURL(t.preview);
      if (t?.url) setHighlights((h) => h.filter((u) => u !== t.url));
      return l.filter((x) => x.key !== k);
    });
  const toggleStar = (url: string) =>
    setHighlights((h) => (h.includes(url) ? h.filter((u) => u !== url) : h.length < MAX_HIGHLIGHTS ? [...h, url] : h));

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    setTiles((l) => arrayMove(l, l.findIndex((t) => t.key === active.id), l.findIndex((t) => t.key === over.id)));
  }

  async function start(files: File[]) {
    // Placeholders go in straight away, in the chosen order, and fill in as each upload lands.
    const jobs = files.map((file) => ({ file, key: key(), preview: URL.createObjectURL(file) }));
    setTiles((l) => [...l, ...jobs.map((j) => ({ key: j.key, url: "", preview: j.preview, progress: 0 }))]);
    let next = 0;
    const worker = async () => {
      while (next < jobs.length) {
        const j = jobs[next++];
        try {
          const done = await uploadImage(j.file, { ...prepare, onProgress: (p) => patch(j.key, { progress: p }) });
          patch(j.key, { url: done.url, preview: undefined });
          URL.revokeObjectURL(j.preview);
        } catch (e) {
          patch(j.key, { error: (e as Error).message });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker));
  }

  return (
    <div data-uploading={busy ? "true" : undefined} className="space-y-4">
      <input ref={notify} type="hidden" />
      {tiles.map((t) => t.url && <input key={t.key} type="hidden" name={name} value={t.url} />)}
      {highlightsName &&
        tiles.filter((t) => t.url && highlights.includes(t.url)).map((t) => <input key={t.key} type="hidden" name={highlightsName} value={t.url} />)}
      {highlightsName && tiles.length > 0 && (
        <p className="text-xs text-graphite">
          Drag to reorder. Star up to six images to show on the project page ({highlights.length}/{MAX_HIGHLIGHTS})
          {highlights.length ? "" : " — with none starred, the first six are shown"}. The rest open under “View all photos”.
        </p>
      )}
      {tiles.length > 0 && (
        <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={tiles.map((t) => t.key)} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-3 gap-3 md:grid-cols-4">
              {tiles.map((t) => (
                <GalleryTile
                  key={t.key}
                  tile={t}
                  starred={Boolean(highlightsName) && highlights.includes(t.url)}
                  canStar={Boolean(highlightsName) && highlights.length < MAX_HIGHLIGHTS}
                  onStar={() => toggleStar(t.url)}
                  onRemove={() => drop(t.key)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      <DropTarget multiple onFiles={start} className="rounded border border-dashed border-black/15 px-4 py-6 text-center">
        <p className="text-sm">Drop images here or click to browse</p>
        <p className="mt-1 text-xs text-graphite">
          JPG, PNG, WebP or AVIF. Large images are resized to {prepare?.maxEdge ?? MAX_IMAGE_EDGE}px and converted to WebP before uploading.
        </p>
      </DropTarget>
      <LinkButton onClick={() => setPicking(true)}>Choose from library</LinkButton>
      {picking && (
        <MediaPicker
          multiple
          exclude={tiles.map((t) => t.url).filter(Boolean)}
          onClose={() => setPicking(false)}
          onSelect={(urls) => {
            setTiles((l) => [...l, ...urls.map((url) => ({ key: key(), url }))]);
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}
