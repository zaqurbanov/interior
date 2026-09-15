"use client";

import { startTransition } from "react";

/** Submit handler that runs a server action without React's automatic form reset,
 *  so field values survive validation errors. */
export function submitWith(action: (fd: FormData) => void) {
  return (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => action(fd));
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
