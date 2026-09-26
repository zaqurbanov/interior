import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import ProjectForm from "@/components/admin/ProjectForm";
import RevisionList from "@/components/admin/RevisionList";
import { listRevisions } from "@/lib/revisions";
import { connectDB } from "@/lib/db";
import { toProject } from "@/lib/data";
import { toHtml } from "@/lib/rich-text";
import { Project, Service } from "@/models";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const [doc, services] = await Promise.all([
    Project.findById(id).lean(),
    Service.find({}, { slug: 1, title: 1 }).sort({ order: 1 }).lean(),
  ]);
  if (!doc) notFound();
  const project = toProject(doc);
  // Older descriptions are plain text; the editor works in HTML.
  project.content = project.content && toHtml(project.content);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Edit: {project.title}</h1>
        <Link href={`/admin/projects/${project.id}/story`} className="btn btn-ghost">Walkthrough →</Link>
      </div>
      <ProjectForm project={project} services={services.map((s) => ({ slug: s.slug, title: s.title }))} />
      <RevisionList items={await listRevisions("project", id)} />
    </div>
  );
}
