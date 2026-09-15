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
      onClick={() => confirm(confirmText) && start(() => action())}
      className="text-sm text-red-700 hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}
