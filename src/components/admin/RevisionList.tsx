"use client";

import { useEffect, useState, useTransition } from "react";
import { restoreRevision } from "@/app/actions/revisions";
import type { RevisionItem } from "@/lib/revisions";

function When({ iso }: { iso: string }) {
  const [text, setText] = useState("");
  useEffect(() => setText(new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })), [iso]);
  return <time dateTime={iso}>{text}</time>;
}

/** Earlier saved versions, newest first, each restorable. */
export default function RevisionList({ items }: { items: RevisionItem[] }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");

  return (
    <details className="rounded-lg border border-black/5 bg-white">
      <summary className="cursor-pointer list-none p-5 font-medium">
        History <span className="font-normal text-graphite">({items.length} earlier {items.length === 1 ? "version" : "versions"})</span>
      </summary>
      <div className="border-t border-black/5 p-5 text-sm">
        <p className="mb-3 text-graphite">A copy is kept before every save (the last 20). Restoring keeps the current version too, so it can be undone.</p>
        {items.length ? (
          <ul className="divide-y divide-black/5">
            {items.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
                <span className="tabular-nums"><When iso={r.createdAt} /></span>
                <span className="text-graphite">{r.label}</span>
                {r.author && <span className="text-xs text-graphite">{r.author}</span>}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    confirm("Replace the current version with this one?") &&
                    start(async () => {
                      const res = await restoreRevision(r.id).catch((e: Error) => ({ ok: false, message: e.message }));
                      setMessage(res.message);
                      // The form holds the old values; start from the restored ones.
                      if (res.ok) window.location.reload();
                    })
                  }
                  className="ml-auto cursor-pointer text-bronze hover:underline disabled:opacity-50"
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-graphite">Nothing yet — versions appear here after the next save.</p>
        )}
        {message && <p className="mt-3 text-red-700" role="status">{message}</p>}
      </div>
    </details>
  );
}
