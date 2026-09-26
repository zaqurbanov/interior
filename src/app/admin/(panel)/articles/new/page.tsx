import ArticleForm from "@/components/admin/ArticleForm";
import { connectDB } from "@/lib/db";
import { articleFormOptions } from "../data";

export const metadata = { title: "New article" };

export default async function NewArticlePage() {
  await connectDB();
  const options = await articleFormOptions();
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">New article</h1>
      <ArticleForm {...options} />
    </div>
  );
}
