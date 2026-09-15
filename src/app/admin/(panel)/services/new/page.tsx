import ServiceForm from "@/components/admin/ServiceForm";

export const metadata = { title: "New service" };

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">New service</h1>
      <ServiceForm />
    </div>
  );
}
