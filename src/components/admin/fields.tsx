"use client";

import { startTransition, useEffect, useRef, useState } from "react";

/** Submit handler that runs a server action without React's automatic form reset,
 *  so field values survive validation errors. Holds the save while an image is
 *  still uploading (ImageUpload marks itself with data-uploading). */
export function submitWith(action: (fd: FormData) => void) {
  /** Returns whether the form was actually submitted. */
  return (ev: React.FormEvent<HTMLFormElement>): boolean => {
    ev.preventDefault();
    if (ev.currentTarget.querySelector("[data-uploading]")) {
      window.alert("An image is still uploading — save again once it has finished.");
      return false;
    }
    const fd = new FormData(ev.currentTarget);
    startTransition(() => action(fd));
    return true;
  };
}

export function Field({
  label,
  name,
  defaultValue,
  error,
  textarea,
  rows = 4,
  hint,
  type = "text",
  required,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  error?: string[];
  textarea?: boolean;
  rows?: number;
  hint?: string;
  type?: string;
  required?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}{required && " *"}</label>
      {textarea ? (
        <textarea id={name} name={name} rows={rows} defaultValue={defaultValue} className="field" required={required} />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          className="field"
          required={required}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        />
      )}
      {hint && !error && <p className="mt-1 text-xs text-graphite">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-700">{error[0]}</p>}
    </div>
  );
}

export function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[#1b1a18]" />
      {label}
    </label>
  );
}

export function SubmitButton({ children = "Save", pending }: { children?: React.ReactNode; pending: boolean }) {
  return <button className="btn" disabled={pending}>{pending ? "Saving…" : children}</button>;
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-black/5 bg-white p-5 md:p-6">
      <h2 className="mb-5 font-medium">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/**
 * For inputs whose value changes in code (uploads, pickers, editors): fires a
 * bubbling "input" event from the returned element after each change, so the
 * form's onInput — unsaved-changes tracking and local drafts — sees it.
 */
export function useNotifyChange(value: unknown) {
  const ref = useRef<HTMLInputElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    ref.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [value]);
  return ref;
}

/** Offer to bring back unsaved edits kept from an earlier visit (see useFormDraft). */
export function DraftBanner({ at, onRestore, onDiscard }: { at: string; onRestore: () => void; onDiscard: () => void }) {
  return (
    <div role="status" className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm lg:col-span-3">
      <span className="flex-1">You have unsaved changes from {at}.</span>
      <button type="button" onClick={onRestore} className="btn">Restore them</button>
      <button type="button" onClick={onDiscard} className="btn btn-ghost">Discard</button>
    </div>
  );
}

/** Date and time in the admin's own time zone, posted as an ISO string. */
export function DateTimeField({ name, label, defaultValue = "", hint }: { name: string; label: string; defaultValue?: string; hint?: string }) {
  const toLocal = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  // null until mounted: the server does not know the browser's time zone, so
  // the local value is filled in on the client; until then post the original.
  const [local, setLocal] = useState<string | null>(null);
  useEffect(() => setLocal(toLocal(defaultValue)), [defaultValue]);
  const iso = local === null ? defaultValue : local ? new Date(local).toISOString() : "";
  const notify = useNotifyChange(iso);
  return (
    <div>
      <label className="label" htmlFor={`${name}-local`}>{label}</label>
      <div className="flex gap-2">
        <input id={`${name}-local`} type="datetime-local" value={local ?? ""} onChange={(e) => setLocal(e.target.value)} className="field" />
        {local && (
          <button type="button" onClick={() => setLocal("")} className="btn btn-ghost px-3" aria-label="Clear date">×</button>
        )}
      </div>
      <input ref={notify} type="hidden" name={name} value={iso} />
      {hint && <p className="mt-1 text-xs text-graphite">{hint}</p>}
    </div>
  );
}
