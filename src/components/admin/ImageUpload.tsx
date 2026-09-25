"use client";

import { useRef, useState } from "react";
import { IMAGE_ACCEPT, MAX_IMAGE_EDGE } from "@/lib/upload-config";
import { uploadImage, type PrepareOptions } from "@/lib/upload-client";
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

  return (
    <div data-uploading={job ? "true" : undefined} className="space-y-2">
      <input type="hidden" name={name} value={url} />
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

export function GalleryField({ name, defaultValue = [], prepare }: { name: string; defaultValue?: string[]; prepare?: PrepareOptions }) {
  const [tiles, setTiles] = useState<Tile[]>(() => defaultValue.map((url) => ({ key: key(), url })));
  const [picking, setPicking] = useState(false);
  const busy = tiles.some((t) => !t.url && !t.error);

  const patch = (k: string, p: Partial<Tile>) => setTiles((l) => l.map((t) => (t.key === k ? { ...t, ...p } : t)));
  const drop = (k: string) =>
    setTiles((l) => {
      const t = l.find((x) => x.key === k);
      if (t?.preview) URL.revokeObjectURL(t.preview);
      return l.filter((x) => x.key !== k);
    });

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
      {tiles.map((t) => t.url && <input key={t.key} type="hidden" name={name} value={t.url} />)}
      {tiles.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 md:grid-cols-4">
          {tiles.map((t) => (
            <li key={t.key} className="relative aspect-square overflow-hidden rounded bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.url || t.preview} alt="" className={`h-full w-full object-cover ${t.url ? "" : "opacity-60"}`} />
              {!t.url && !t.error && <Progress value={t.progress ?? 0} />}
              {t.error && (
                <p className="absolute inset-0 overflow-y-auto bg-red-50/95 p-2 pt-8 text-[0.7rem] leading-snug text-red-800">{t.error}</p>
              )}
              {(t.url || t.error) && (
                <button
                  type="button"
                  onClick={() => drop(t.key)}
                  className="absolute right-1 top-1 cursor-pointer rounded bg-white/90 px-2 py-0.5 text-xs text-red-700"
                >
                  {t.error ? "Dismiss" : "Remove"}
                </button>
              )}
            </li>
          ))}
        </ul>
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
