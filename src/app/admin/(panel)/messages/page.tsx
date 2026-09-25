import Link from "next/link";
import EnquiryCard from "@/components/admin/EnquiryCard";
import { connectDB } from "@/lib/db";
import { toMessage } from "@/lib/data";
import { ENQUIRY_STATUSES, enquiryQuery, type EnquiryFilter } from "@/lib/enquiries";
import { mailConfigured } from "@/lib/mail";
import { Message } from "@/models";

export const metadata = { title: "Enquiries" };

type Props = { searchParams: Promise<EnquiryFilter> };

export default async function AdminEnquiries({ searchParams }: Props) {
  const filter = await searchParams;
  await connectDB();
  const [docs, byStatus, allTags] = await Promise.all([
    Message.find(enquiryQuery(filter)).sort({ createdAt: -1 }).limit(500).lean(),
    Message.aggregate<{ _id: string; n: number }>([{ $group: { _id: { $ifNull: ["$status", "new"] }, n: { $sum: 1 } } }]),
    Message.distinct("tags") as Promise<string[]>,
  ]);
  const messages = docs.map(toMessage);
  const count = (id: string) => byStatus.find((s) => s._id === id)?.n ?? 0;
  const total = byStatus.reduce((n, s) => n + (s._id === "spam" ? 0 : s.n), 0);

  // Links keep the other filters.
  const href = (patch: EnquiryFilter) => {
    const p = new URLSearchParams(Object.entries({ ...filter, ...patch }).filter(([, v]) => v) as [string, string][]);
    const qs = p.toString();
    return `/admin/messages${qs ? `?${qs}` : ""}`;
  };
  const exportHref = `/api/admin/enquiries/export${href({}).replace("/admin/messages", "")}`;
  const tabs = [{ id: "", label: "All", n: total }, ...ENQUIRY_STATUSES.map((s) => ({ id: s.id, label: s.label, n: count(s.id) }))];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">
          Enquiries <span className="text-lg text-graphite">({count("new")} new)</span>
        </h1>
        <a href={exportHref} className="btn btn-ghost">Export CSV</a>
      </div>

      {!mailConfigured() && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
          Email alerts are off: set <code>RESEND_API_KEY</code> (and <code>MAIL_FROM</code>) to be notified of new enquiries and to send clients an automatic reply.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => {
          const on = (filter.status ?? "") === t.id;
          return (
            <Link
              key={t.id || "all"}
              href={href({ status: t.id })}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                on ? "border-ink bg-ink text-ivory" : "border-black/10 bg-white text-graphite hover:border-black/30 hover:text-ink"
              }`}
            >
              {t.label} <span className="opacity-60">{t.n}</span>
            </Link>
          );
        })}
        <form action="/admin/messages" className="ml-auto flex gap-2">
          {filter.status && <input type="hidden" name="status" value={filter.status} />}
          {filter.tag && <input type="hidden" name="tag" value={filter.tag} />}
          <input type="search" name="q" defaultValue={filter.q} placeholder="Search name, email, message, notes" className="field w-64 py-1.5 text-sm" />
          <button className="btn btn-ghost py-1.5">Search</button>
        </form>
      </div>

      {(filter.tag || filter.q) && (
        <p className="flex flex-wrap items-center gap-3 text-sm text-graphite">
          {filter.tag && <span>Tag <b className="text-ink">#{filter.tag}</b></span>}
          {filter.q && <span>Search <b className="text-ink">“{filter.q}”</b></span>}
          <Link href={href({ tag: "", q: "" })} className="text-bronze hover:underline">Clear</Link>
        </p>
      )}

      {allTags.length > 0 && !filter.tag && (
        <p className="flex flex-wrap gap-2 text-xs">
          {allTags.sort().map((t) => (
            <Link key={t} href={href({ tag: t })} className="rounded-full bg-sand px-2 py-0.5 hover:bg-black/10">#{t}</Link>
          ))}
        </p>
      )}

      <ul className="space-y-3">
        {messages.map((m) => (
          <EnquiryCard key={m.id} m={m} allTags={allTags} />
        ))}
        {!messages.length && <li className="rounded-lg border border-black/5 bg-white p-6 text-sm text-graphite">No enquiries here.</li>}
      </ul>
    </div>
  );
}
