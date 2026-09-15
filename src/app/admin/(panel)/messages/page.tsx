import { deleteMessage, setMessageRead } from "@/app/actions/admin";
import DeleteButton from "@/components/admin/DeleteButton";
import { getMessages } from "@/lib/data";

export const metadata = { title: "Messages" };

export default async function AdminMessages() {
  const messages = await getMessages();
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">
        Messages <span className="text-lg text-graphite">({unread} unread)</span>
      </h1>
      <ul className="space-y-3">
        {messages.map((m) => (
          <li key={m.id} className={`rounded-lg border bg-white ${m.read ? "border-black/5" : "border-bronze/50"}`}>
            <details className="group" open={!m.read}>
              <summary className="flex cursor-pointer list-none items-center gap-4 p-4">
                {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-bronze" aria-label="Unread" />}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {m.name} {m.subject && <span className="font-normal text-graphite">— {m.subject}</span>}
                  </p>
                  <p className="truncate text-sm text-graphite group-open:hidden">{m.body}</p>
                </div>
                <time className="shrink-0 text-xs text-graphite">
                  {new Date(m.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                </time>
              </summary>
              <div className="space-y-4 border-t border-black/5 p-4 text-sm">
                <p className="flex flex-wrap gap-x-6 gap-y-1 text-graphite">
                  <a href={`mailto:${m.email}`} className="text-ink hover:underline">{m.email}</a>
                  {m.phone && <a href={`tel:${m.phone}`} className="hover:underline">{m.phone}</a>}
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                <div className="flex items-center gap-4">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "Your enquiry"}`)}`} className="btn">Reply</a>
                  <form action={setMessageRead.bind(null, m.id, !m.read)}>
                    <button className="btn btn-ghost">{m.read ? "Mark unread" : "Mark read"}</button>
                  </form>
                  <DeleteButton action={deleteMessage.bind(null, m.id)} confirmText="Delete this message?" />
                </div>
              </div>
            </details>
          </li>
        ))}
        {!messages.length && <li className="rounded-lg border border-black/5 bg-white p-6 text-sm text-graphite">No messages yet.</li>}
      </ul>
    </div>
  );
}
