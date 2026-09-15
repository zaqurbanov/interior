import Link from "next/link";
import { connectDB } from "@/lib/db";
import { toMessage } from "@/lib/data";
import { Message, Project, Service } from "@/models";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  await connectDB();
  const [projects, services, messages, unread, latest] = await Promise.all([
    Project.countDocuments(),
    Service.countDocuments(),
    Message.countDocuments(),
    Message.countDocuments({ read: false }),
    Message.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const cards = [
    { label: "Projects", value: projects, href: "/admin/projects" },
    { label: "Services", value: services, href: "/admin/services" },
    { label: "Messages", value: messages, href: "/admin/messages" },
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
        <div className="flex items-center justify-between border-b border-black/5 p-5">
          <h2 className="font-medium">Latest messages</h2>
          <Link href="/admin/messages" className="text-sm text-bronze hover:underline">View all</Link>
        </div>
        <ul className="divide-y divide-black/5">
          {latest.map(toMessage).map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-4 p-5 text-sm">
              <div className="min-w-0">
                <p className="font-medium">
                  {!m.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-bronze" />}
                  {m.name} <span className="font-normal text-graphite">· {m.email}</span>
                </p>
                <p className="truncate text-graphite">{m.body}</p>
              </div>
              <time className="shrink-0 text-xs text-graphite">{new Date(m.createdAt).toLocaleDateString("en-GB")}</time>
            </li>
          ))}
          {!latest.length && <li className="p-5 text-sm text-graphite">No messages yet.</li>}
        </ul>
      </section>
    </div>
  );
}
