import Link from "next/link";
import SkeletonImage from "./SkeletonImage";
import { formatDate } from "@/lib/dates";
import type { ArticleData } from "@/lib/types";

/** Journal teaser: cover, category · date, headline, excerpt. */
export default function ArticleCard({ article, date, large, alt }: { article: ArticleData; date: string; large?: boolean; alt?: string }) {
  return (
    <Link href={`/journal/${article.slug}`} className={`reveal group block ${large ? "md:grid md:grid-cols-12 md:items-end md:gap-10" : ""}`}>
      <div className={`relative overflow-hidden bg-sand ${large ? "aspect-[16/10] md:col-span-7" : "aspect-[4/3]"}`}>
        {article.coverImage ? (
          <SkeletonImage
            src={article.coverImage}
            alt={alt || article.title}
            sizes={large ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
            className="object-cover ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-8 text-center font-serif text-3xl text-ink/30">{article.title}</div>
        )}
      </div>
      <div className={large ? "mt-6 md:col-span-5 md:mt-0" : "mt-5"}>
        <p className="eyebrow text-[0.62rem] text-bronze">
          {[article.category, formatDate(date)].filter(Boolean).join(" · ")}
        </p>
        <h3 className={`mt-3 font-serif leading-tight text-ink ${large ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"}`}>{article.title}</h3>
        {article.excerpt && <p className={`mt-3 text-graphite ${large ? "text-lg" : "line-clamp-3 text-sm"}`}>{article.excerpt}</p>}
        <span className="mt-4 inline-block text-sm text-ink underline decoration-bronze underline-offset-4">Read the article</span>
      </div>
    </Link>
  );
}
