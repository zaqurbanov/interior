import ProjectForm from "@/components/admin/ProjectForm";

export const metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">New project</h1>
      <ProjectForm />
    </div>
  );
}
