import Link from "next/link";
import { DailyBars, TopList } from "@/components/admin/charts";
import { enquiriesPerDay, needsAttention, topProjects, viewsPerDay } from "@/lib/dashboard";
import { connectDB } from "@/lib/db";
import { toMessage } from "@/lib/data";
import { Message, Project, Service } from "@/models";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  await connectDB();
  const [projects, services, messages, unread, latest, enquiries, views, top, attention] = await Promise.all([
    Project.countDocuments(),
    Service.countDocuments(),
    Message.countDocuments({ status: { $ne: "spam" } }),
    Message.countDocuments({ read: false, status: { $ne: "spam" } }),
    Message.find({ status: { $ne: "spam" } }).sort({ createdAt: -1 }).limit(5).lean(),
    enquiriesPerDay(),
    viewsPerDay(),
    topProjects(),
    needsAttention(),
  ]);

  const cards = [
    { label: "Projects", value: projects, href: "/admin/projects" },
    { label: "Services", value: services, href: "/admin/services" },
    { label: "Enquiries", value: messages, href: "/admin/messages" },
    { label: "Unread", value: unread, href: "/admin/messages" },
  ];

  return (
    <div className="space-y-10">
      <h1 className="font-serif text-4xl">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-lg border border-black/5 bg-white p-5 transition hover:shadow-sm">
            <p className="text-sm text-graphite">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold">{c.value}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-lg border border-black/5 bg-white">
        <h2 className="border-b border-black/5 p-5 font-medium">Needs attention</h2>
        {attention.length ? (
          <ul className="divide-y divide-black/5">
            {attention.map((a) => (
              <li key={a.text} className="flex gap-3 p-5 text-sm">
                {/* Status is shown by icon and word, not colour alone. */}
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide ${
                    a.tone === "warning" ? "bg-amber-100 text-amber-900" : "bg-sky-50 text-sky-900"
                  }`}
                >
                  {a.tone === "warning" ? "⚠ To do" : "ℹ Tip"}
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={a.href} className="font-medium hover:underline">{a.text}</Link>
                  {a.items && (
                    <p className="mt-1 text-graphite">
                      {a.items.slice(0, 6).join(" · ")}
                      {a.items.length > 6 && ` · and ${a.items.length - 6} more`}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-5 text-sm text-graphite">All clear.</p>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <DailyBars title="Enquiries" data={enquiries} unit={["enquiry", "enquiries"]} />
        <DailyBars title="Visits" data={views} unit={["page view", "page views"]} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <TopList title="Most viewed projects (30 days)" rows={top} empty="No visits counted yet — views are counted from now on." />
        <section className="rounded-lg border border-black/5 bg-white">
          <div className="flex items-center justify-between border-b border-black/5 p-5">
            <h2 className="font-medium">Latest enquiries</h2>
            <Link href="/admin/messages" className="text-sm text-bronze hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-black/5">
            {latest.map(toMessage).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 p-5 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">
                    {!m.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-bronze" aria-label="Unread" />}
                    {m.name} <span className="font-normal text-graphite">· {m.email}</span>
                  </p>
                  <p className="truncate text-graphite">{m.body}</p>
                </div>
                <time className="shrink-0 text-xs text-graphite">{new Date(m.createdAt).toLocaleDateString("en-GB")}</time>
              </li>
            ))}
            {!latest.length && <li className="p-5 text-sm text-graphite">No enquiries yet.</li>}
          </ul>
        </section>
      </div>
      <p className="text-xs text-graphite">
        Visits are counted on this site itself: one per page per browser session, no cookies and nothing about the visitor is stored. Bots and your own draft previews are left out.
      </p>
    </div>
  );
}
