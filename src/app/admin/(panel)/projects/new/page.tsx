import ProjectForm from "@/components/admin/ProjectForm";
import { connectDB } from "@/lib/db";
import { Service } from "@/models";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  await connectDB();
  const services = await Service.find({}, { slug: 1, title: 1 }).sort({ order: 1 }).lean();
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">New project</h1>
      <ProjectForm services={services.map((s) => ({ slug: s.slug, title: s.title }))} />
    </div>
  );
}
