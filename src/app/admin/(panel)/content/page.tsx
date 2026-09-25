import SiteContentForm from "@/components/admin/SiteContentForm";
import { connectDB } from "@/lib/db";
import { toSiteContent } from "@/lib/data";
import { SiteContent } from "@/models";

export const metadata = { title: "Site content & SEO" };

export default async function SiteContentPage() {
  // Straight from the database (no fallback), like the other admin pages.
  await connectDB();
  const content = toSiteContent(await SiteContent.findOne({ key: "main" }).lean());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Site content & SEO</h1>
        <p className="mt-2 text-sm text-graphite">Texts, contact details and search settings used across the public site.</p>
      </div>
      <SiteContentForm content={content} />
    </div>
  );
}
