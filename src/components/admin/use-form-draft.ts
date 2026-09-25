"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Unsaved-changes protection for admin forms:
//  - every edit is kept in localStorage, so a closed tab or crash loses nothing
//    and the form offers to restore it next time;
//  - leaving the page (reload, close, or an in-app link) with unsaved edits asks first.
// Nothing is sent to the server until the admin presses Save — an automatic
// server save would publish half-finished edits on a live page.

export type DraftEntries = [string, string][];
type Stored = { at: number; entries: DraftEntries };

const PREFIX = "vf-admin-draft:";

const read = (key: string): Stored | null => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
};
const write = (key: string, value: Stored | null) => {
  try {
    if (value) localStorage.setItem(PREFIX + key, JSON.stringify(value));
    else localStorage.removeItem(PREFIX + key);
  } catch {}
};

export function useFormDraft(key: string) {
  const formRef = useRef<HTMLFormElement>(null);
  const baseline = useRef<string | null>(null);
  const saving = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [dirty, setDirty] = useState(false);
  const [offer, setOffer] = useState<Stored | null>(null);

  const snapshot = useCallback((): DraftEntries => {
    const form = formRef.current;
    if (!form) return [];
    return [...new FormData(form)].filter((e): e is [string, string] => typeof e[1] === "string");
  }, []);

  const check = useCallback(() => {
    if (baseline.current === null) return;
    const entries = snapshot();
    const isDirty = JSON.stringify(entries) !== baseline.current;
    setDirty(isDirty);
    write(key, isDirty ? { at: Date.now(), entries } : null);
  }, [key, snapshot]);

  // The form as loaded from the server is the baseline; an older unsaved edit is offered back.
  useEffect(() => {
    baseline.current = JSON.stringify(snapshot());
    const stored = read(key);
    if (stored && JSON.stringify(stored.entries) !== baseline.current) setOffer(stored);
    else write(key, null);
  }, [key, snapshot]);

  const onInput = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(check, 400);
  }, [check]);

  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (saving.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    // Client-side navigation does not fire beforeunload; catch link clicks instead.
    const onClick = (e: MouseEvent) => {
      if (saving.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.href.startsWith("mailto:")) return;
      if (!window.confirm("You have unsaved changes. Leave this page and keep them as a draft?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  // On a successful save the page redirects and this unmounts: drop the draft then.
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (saving.current) write(key, null);
    },
    [key],
  );

  const dismissOffer = useCallback(() => {
    setOffer(null);
    write(key, null);
  }, [key]);
  const recheck = useCallback(() => {
    setOffer(null);
    setTimeout(check, 0);
  }, [check]);
  const setSaving = useCallback((on: boolean) => {
    saving.current = on;
  }, []);

  return {
    formRef,
    onInput,
    dirty,
    /** Unsaved edits from an earlier visit, if any. */
    offer,
    dismissOffer,
    /** After restored values are rendered, re-check so they count as unsaved. */
    recheck,
    /** Call when the form is submitted, and with false when the save failed. */
    setSaving,
  };
}

/** Time label for the restore banner. */
export function formatDraftTime(at: number) {
  return new Date(at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}
