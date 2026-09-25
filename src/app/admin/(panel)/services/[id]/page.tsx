import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import ServiceForm from "@/components/admin/ServiceForm";
import { connectDB } from "@/lib/db";
import { toService } from "@/lib/data";
import { toHtml } from "@/lib/rich-text";
import { Service } from "@/models";

export const metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const doc = await Service.findById(id).lean();
  if (!doc) notFound();
  const service = toService(doc);
  // Older descriptions are plain text; the editor works in HTML.
  service.content = service.content && toHtml(service.content);
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Edit: {service.title}</h1>
      <ServiceForm service={service} />
    </div>
  );
}
