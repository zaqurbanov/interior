import Link from "next/link";
import ProjectList, { type ProjectRow } from "@/components/admin/ProjectList";
import { connectDB } from "@/lib/db";
import { projectStatus, toProject } from "@/lib/data";
import { Project } from "@/models";

export const metadata = { title: "Projects" };

export default async function AdminProjects() {
  await connectDB();
  const projects = (await Project.find().sort({ order: 1, createdAt: -1 }).lean()).map(toProject);
  const rows: ProjectRow[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    location: p.location,
    coverImage: p.coverImage,
    featured: p.featured,
    status: projectStatus(p),
    publishAt: p.publishAt,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">Projects</h1>
        <Link href="/admin/projects/new" className="btn">+ New project</Link>
      </div>
      <ProjectList projects={rows} />
    </div>
  );
}
