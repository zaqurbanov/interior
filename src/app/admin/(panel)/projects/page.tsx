import Image from "next/image";
import Link from "next/link";
import { deleteProject } from "@/app/actions/admin";
import DeleteButton from "@/components/admin/DeleteButton";
import { connectDB } from "@/lib/db";
import { toProject } from "@/lib/data";
import { Project } from "@/models";

export const metadata = { title: "Projects" };

export default async function AdminProjects() {
  await connectDB();
  const projects = (await Project.find().sort({ order: 1, createdAt: -1 }).lean()).map(toProject);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">Projects</h1>
        <Link href="/admin/projects/new" className="btn">+ New project</Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-black/5 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/5 text-xs uppercase tracking-wide text-graphite">
            <tr>
              <th className="p-4">Project</th>
              <th className="p-4">Order</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {projects.map((p) => (
              <tr key={p.id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-sand">
                      {p.coverImage && <Image src={p.coverImage} alt="" fill sizes="64px" className="object-cover" />}
                    </div>
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-graphite">/{p.slug} · {p.location}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">{p.order}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                    {p.published ? "Published" : "Draft"}
                  </span>
                  {p.featured && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Featured</span>}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-4">
                    <Link href={`/admin/projects/${p.id}`} className="text-sm hover:underline">Edit</Link>
                    <DeleteButton action={deleteProject.bind(null, p.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {!projects.length && (
              <tr><td colSpan={4} className="p-6 text-graphite">No projects yet. Run <code>npm run seed</code> or create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
