import Link from "next/link";
import { deleteArticle } from "@/app/actions/articles";
import DeleteButton from "@/components/admin/DeleteButton";
import { connectDB } from "@/lib/db";
import { articleDate, projectStatus, toArticle } from "@/lib/data";
import { Article } from "@/models";

export const metadata = { title: "Journal" };

const BADGE = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-sky-50 text-sky-900",
  live: "bg-green-50 text-green-800",
} as const;

export default async function AdminArticles() {
  await connectDB();
  const articles = (await Article.find({}, { content: 0 }).sort({ publishAt: -1, createdAt: -1 }).lean()).map(toArticle);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Journal</h1>
          <p className="mt-2 max-w-2xl text-sm text-graphite">
            Articles at <code>/journal</code>. Each one is a page Google can find: write about what clients search for — design guides, materials,
            behind a project, areas of London.
          </p>
        </div>
        <Link href="/admin/articles/new" className="btn">+ New article</Link>
      </div>
      <ul className="divide-y divide-black/5 rounded-lg border border-black/5 bg-white">
        {articles.map((a) => {
          const status = projectStatus(a);
          return (
            <li key={a.id} className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {a.title}
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs capitalize ${BADGE[status]}`}>{status}</span>
                </p>
                <p className="truncate text-xs text-graphite">
                  {new Date(articleDate(a)).toISOString().slice(0, 10)} · /journal/{a.slug}
                  {a.category && ` · ${a.category}`}
                  {!a.coverImage && " · no cover image"}
                </p>
              </div>
              {status === "live" && (
                <a href={`/journal/${a.slug}`} target="_blank" className="text-sm text-graphite hover:underline">View ↗</a>
              )}
              <Link href={`/admin/articles/${a.id}`} className="text-sm hover:underline">Edit</Link>
              <DeleteButton action={deleteArticle.bind(null, a.id)} />
            </li>
          );
        })}
        {!articles.length && <li className="p-6 text-sm text-graphite">No articles yet. The journal page stays hidden from the menu until the first one is published.</li>}
      </ul>
    </div>
  );
}
