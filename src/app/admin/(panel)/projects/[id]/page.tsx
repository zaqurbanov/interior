import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import ProjectForm from "@/components/admin/ProjectForm";
import { connectDB } from "@/lib/db";
import { toProject } from "@/lib/data";
import { toHtml } from "@/lib/rich-text";
import { Project } from "@/models";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const doc = await Project.findById(id).lean();
  if (!doc) notFound();
  const project = toProject(doc);
  // Older descriptions are plain text; the editor works in HTML.
  project.content = project.content && toHtml(project.content);
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Edit: {project.title}</h1>
      <ProjectForm project={project} />
    </div>
  );
}
