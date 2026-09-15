import Link from "next/link";
import { deleteService } from "@/app/actions/admin";
import DeleteButton from "@/components/admin/DeleteButton";
import ServiceIcon from "@/components/site/ServiceIcon";
import { connectDB } from "@/lib/db";
import { toService } from "@/lib/data";
import { Service } from "@/models";

export const metadata = { title: "Services" };

export default async function AdminServices() {
  await connectDB();
  const services = (await Service.find().sort({ order: 1 }).lean()).map(toService);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">Services</h1>
        <Link href="/admin/services/new" className="btn">+ New service</Link>
      </div>
      <ul className="divide-y divide-black/5 rounded-lg border border-black/5 bg-white">
        {services.map((s) => (
          <li key={s.id} className="flex items-center gap-4 p-4">
            <ServiceIcon name={s.icon} className="h-6 w-6 shrink-0 text-bronze" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {s.title}
                {!s.published && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Draft</span>}
              </p>
              <p className="truncate text-xs text-graphite">#{s.order} · /services/{s.slug} · {s.summary}</p>
            </div>
            <Link href={`/admin/services/${s.id}`} className="text-sm hover:underline">Edit</Link>
            <DeleteButton action={deleteService.bind(null, s.id)} />
          </li>
        ))}
        {!services.length && <li className="p-6 text-sm text-graphite">No services yet. Run <code>npm run seed</code> or create one.</li>}
      </ul>
    </div>
  );
}
