"use client";

import { useTransition } from "react";

export default function DeleteButton({ action, label = "Delete", confirmText = "Delete this item permanently?" }: {
  action: () => Promise<void>;
  label?: string;
  confirmText?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        confirm(confirmText) &&
        start(async () => {
          // A thrown action (expired session, database down) would otherwise crash the page.
          await action().catch((e: Error) => window.alert(e.message || "Could not delete."));
        })
      }
      className="text-sm text-red-700 hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}
