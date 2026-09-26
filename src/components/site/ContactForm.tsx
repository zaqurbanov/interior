"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type Ref } from "react";
import { sendMessage } from "@/app/actions/contact";
import type { FormState } from "@/lib/validators";

const initial: FormState = { ok: false, message: "" };

function Input({
  name,
  label,
  type = "text",
  error,
  required,
  textarea,
  inputRef,
}: {
  name: string;
  label: string;
  type?: string;
  error?: string[];
  required?: boolean;
  textarea?: boolean;
  inputRef?: Ref<HTMLTextAreaElement>;
}) {
  const cls =
    "w-full border-0 border-b border-ink/25 bg-transparent px-0 py-3 text-base text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none focus:ring-0";
  return (
    <label className="block">
      <span className="eyebrow text-[0.62rem] text-graphite">
        {label}
        {required && " *"}
      </span>
      {textarea ? (
        <textarea ref={inputRef} name={name} rows={4} required={required} className={`${cls} resize-none`} aria-invalid={!!error} />
      ) : (
        <input name={name} type={type} required={required} className={cls} aria-invalid={!!error} />
      )}
      {error && <span className="mt-1 block text-xs text-red-400">{error[0]}</span>}
    </label>
  );
}

export default function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, initial);
  // When the form appeared; the server drops submissions made implausibly fast (bots).
  const [startedAt, setStartedAt] = useState("");
  useEffect(() => setStartedAt(String(Date.now())), []);

  // Arriving from a project page ("/contact?project=Chelsea Apartment"): start the message for them.
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const project = new URLSearchParams(window.location.search).get("project")?.slice(0, 120).trim();
    const body = bodyRef.current;
    if (project && body && !body.value) body.value = `I would like a project similar to ${project}. `;
  }, []);

  if (state.ok) {
    return (
      <div className="border border-ink/15 p-10" role="status">
        <p className="font-serif text-3xl text-ink">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      // Submitted by hand rather than through `action`, so React does not clear
      // what the visitor typed when the server sends back a validation error.
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="grid gap-8 md:grid-cols-2"
      noValidate
    >
      <Input name="name" label="Name" required error={state.errors?.name} />
      <Input name="email" label="Email" type="email" required error={state.errors?.email} />
      <Input name="phone" label="Phone" type="tel" error={state.errors?.phone} />
      <Input name="subject" label="Project type" error={state.errors?.subject} />
      <div className="md:col-span-2">
        <Input name="body" label="Tell us about your space" required textarea inputRef={bodyRef} error={state.errors?.body} />
      </div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className="flex flex-wrap items-center gap-6 md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-8 py-4 text-sm tracking-wide text-ivory transition hover:bg-bronze disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send enquiry"}
        </button>
        {state.message && <p className="text-sm text-red-400" role="alert">{state.message}</p>}
      </div>
    </form>
  );
}
