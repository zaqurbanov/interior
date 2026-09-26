import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import ArticleForm from "@/components/admin/ArticleForm";
import RevisionList from "@/components/admin/RevisionList";
import { listRevisions } from "@/lib/revisions";
import { connectDB } from "@/lib/db";
import { toArticle } from "@/lib/data";
import { Article } from "@/models";
import { articleFormOptions } from "../data";

export const metadata = { title: "Edit article" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const doc = await Article.findById(id).lean();
  if (!doc) notFound();
  const [options, revisions] = await Promise.all([articleFormOptions(), listRevisions("article", id)]);
  const article = toArticle(doc);
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Edit: {article.title}</h1>
      <ArticleForm article={article} {...options} />
      <RevisionList items={revisions} />
    </div>
  );
}
