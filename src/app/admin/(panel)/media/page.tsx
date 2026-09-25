import MediaLibrary from "@/components/admin/MediaLibrary";
import { listLibrary } from "@/lib/media";

export const metadata = { title: "Media" };

export default async function AdminMedia({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;
  const items = await listLibrary();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Media</h1>
        <p className="mt-2 max-w-2xl text-sm text-graphite">
          Every image on the site, with where it is used. Alt text describes an image for Google and for screen readers — it is used on the public pages
          wherever the image appears.
        </p>
      </div>
      <MediaLibrary items={items} initialFilter={filter === "no-alt" || filter === "unused" ? filter : "all"} />
    </div>
  );
}
