"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { deleteMessage, setMessageRead } from "@/app/actions/admin";
import { addEnquiryNote, deleteEnquiryNote, setEnquiryStatus, setEnquiryTags } from "@/app/actions/enquiries";
import { ENQUIRY_STATUSES, normalizeTag } from "@/lib/enquiries";
import type { MessageData } from "@/lib/types";
import type { FormState } from "@/lib/validators";
import DeleteButton from "./DeleteButton";

/** Server actions throw when the session has expired or the database is down;
 *  turn that into a result so the page shows a message instead of crashing. */
const call = (p: Promise<FormState | void>): Promise<FormState> =>
  p
    .then((r) => r ?? { ok: true, message: "" })
    .catch((e: Error) => ({
      ok: false,
      message: e.message === "Unauthorized" ? "Your session has expired — sign in again." : e.message || "Could not save.",
    }));

/** Formatted in the browser, in the admin's time zone. */
function When({ iso, withTime = true }: { iso: string; withTime?: boolean }) {
  const [text, setText] = useState("");
  useEffect(
    () => setText(new Date(iso).toLocaleString("en-GB", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" })),
    [iso, withTime],
  );
  return <time dateTime={iso}>{text}</time>;
}

export function StatusBadge({ status }: { status: MessageData["status"] }) {
  const s = ENQUIRY_STATUSES.find((x) => x.id === status) ?? ENQUIRY_STATUSES[0];
  return <span className={`rounded-full px-2 py-0.5 text-xs ${s.badge}`}>{s.label}</span>;
}

function Tags({ id, tags, allTags }: { id: string; tags: string[]; allTags: string[] }) {
  const [list, setList] = useState(tags);
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();
  const save = (next: string[]) => {
    const previous = list;
    setList(next);
    start(async () => {
      const res = await call(setEnquiryTags(id, next));
      if (!res.ok) setList(previous);
    });
  };
  const add = () => {
    const t = normalizeTag(draft);
    setDraft("");
    if (t && !list.includes(t)) save([...list, t]);
  };
  const suggestions = allTags.filter((t) => !list.includes(t));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {list.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-xs">
          <Link href={`/admin/messages?tag=${encodeURIComponent(t)}`} className="hover:underline">#{t}</Link>
          <button type="button" onClick={() => save(list.filter((x) => x !== t))} className="cursor-pointer text-graphite hover:text-red-700" aria-label={`Remove tag ${t}`}>
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        list={`tags-${id}`}
        placeholder="+ tag"
        aria-label="Add a tag"
        disabled={pending}
        className="w-24 rounded border border-transparent bg-transparent px-1.5 py-0.5 text-xs hover:border-black/10 focus:border-black/20 focus:outline-none"
      />
      <datalist id={`tags-${id}`}>
        {suggestions.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </div>
  );
}

function Notes({ id, notes }: { id: string; notes: MessageData["notes"] }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-graphite">Notes</p>
      {notes.length > 0 && (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.at} className="group rounded border border-black/5 bg-ivory/60 p-2.5">
              <p className="whitespace-pre-wrap">{n.text}</p>
              <p className="mt-1 flex items-center gap-3 text-xs text-graphite">
                <When iso={n.at} />
                <button
                  type="button"
                  onClick={() => confirm("Delete this note?") && start(async () => void (await call(deleteEnquiryNote(id, n.at))))}
                  className="cursor-pointer text-red-700 opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                >
                  Delete
                </button>
              </p>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await call(addEnquiryNote(id, text));
            if (res.ok) setText("");
            setError(res.ok ? "" : res.message);
          });
        }}
        className="flex items-start gap-2"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          placeholder="Add a note — call summary, budget, next step…"
          className="field min-h-9 flex-1 py-1.5 text-sm"
        />
        <button disabled={pending || !text.trim()} className="btn px-3 py-1.5 text-xs">Add</button>
      </form>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

export default function EnquiryCard({ m, allTags }: { m: MessageData; allTags: string[] }) {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState(m.status);
  const [read, setRead] = useState(m.read);
  const [error, setError] = useState("");

  return (
    <li className={`rounded-lg border bg-white ${read ? "border-black/5" : "border-bronze/50"}`}>
      <details
        className="group"
        onToggle={(e) => {
          // Opening an unread enquiry marks it read.
          if ((e.currentTarget as HTMLDetailsElement).open && !read) {
            setRead(true);
            start(async () => {
              if (!(await call(setMessageRead(m.id, true))).ok) setRead(false);
            });
          }
        }}
      >
        <summary className="flex cursor-pointer list-none items-center gap-4 p-4">
          {!read && <span className="h-2 w-2 shrink-0 rounded-full bg-bronze" aria-label="Unread" />}
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 font-medium">
              {m.name}
              {m.subject && <span className="font-normal text-graphite">— {m.subject}</span>}
              <StatusBadge status={status} />
              {m.tags.map((t) => (
                <span key={t} className="text-xs font-normal text-graphite">#{t}</span>
              ))}
            </p>
            <p className="truncate text-sm text-graphite group-open:hidden">{m.body}</p>
          </div>
          <span className="shrink-0 text-xs text-graphite">
            <When iso={m.createdAt} />
          </span>
        </summary>

        <div className="grid gap-6 border-t border-black/5 p-4 text-sm lg:grid-cols-[1fr_18rem]">
          <div className="space-y-4">
            <p className="flex flex-wrap gap-x-6 gap-y-1 text-graphite">
              <a href={`mailto:${m.email}`} className="text-ink hover:underline">{m.email}</a>
              {m.phone && <a href={`tel:${m.phone}`} className="hover:underline">{m.phone}</a>}
            </p>
            <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
            <Notes id={m.id} notes={m.notes} />
          </div>

          <div className="space-y-4 lg:border-l lg:border-black/5 lg:pl-6">
            <div>
              <label className="label" htmlFor={`status-${m.id}`}>Status</label>
              <select
                id={`status-${m.id}`}
                value={status}
                disabled={pending}
                onChange={(e) => {
                  const next = e.target.value as MessageData["status"];
                  const previous = status;
                  const wasRead = read;
                  setStatus(next);
                  setRead(true);
                  start(async () => {
                    const res = await call(setEnquiryStatus(m.id, next));
                    if (!res.ok) {
                      setStatus(previous);
                      setRead(wasRead);
                      setError(res.message);
                    } else setError("");
                  });
                }}
                className="field py-1.5"
              >
                {ENQUIRY_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="label">Tags</p>
              <Tags id={m.id} tags={m.tags} allTags={allTags} />
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "Your enquiry"}`)}`} className="btn">Reply</a>
              <button
                type="button"
                onClick={() => {
                  const next = !read;
                  setRead(next);
                  start(async () => {
                    const res = await call(setMessageRead(m.id, next));
                    if (!res.ok) {
                      setRead(!next);
                      setError(res.message);
                    }
                  });
                }}
                className="btn btn-ghost"
              >
                {read ? "Mark unread" : "Mark read"}
              </button>
              <DeleteButton action={deleteMessage.bind(null, m.id)} confirmText="Delete this enquiry?" />
            </div>
            {error && <p className="text-xs text-red-700" role="alert">{error}</p>}
          </div>
        </div>
      </details>
    </li>
  );
}
