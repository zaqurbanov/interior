"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveArticle } from "@/app/actions/articles";
import type { ArticleData } from "@/lib/types";
import type { FormState } from "@/lib/validators";
import { Card, DateTimeField, DraftBanner, Field, SubmitButton, Toggle, submitWith } from "./fields";
import { ImageField } from "./ImageUpload";
import RichTextEditor from "./RichTextEditor";
import { formatDraftTime, useFormDraft, type DraftEntries } from "./use-form-draft";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

type Initial = Omit<ArticleData, "id" | "createdAt" | "updatedAt">;

const EMPTY: Initial = {
  title: "", slug: "", excerpt: "", content: "", coverImage: "", category: "", tags: [], author: "", projects: [],
  published: false, publishAt: "", seo: { title: "", description: "" },
};

function fromEntries(entries: DraftEntries): Initial {
  const get = (k: string) => entries.find(([n]) => n === k)?.[1] ?? "";
  return {
    title: get("title"), slug: get("slug"), excerpt: get("excerpt"), content: get("content"), coverImage: get("coverImage"),
    category: get("category"), tags: get("tags").split(",").map((t) => t.trim()).filter(Boolean), author: get("author"),
    projects: entries.filter(([n]) => n === "projects").map(([, v]) => v),
    published: get("published") === "on", publishAt: get("publishAt"),
    seo: { title: get("seoTitle"), description: get("seoDescription") },
  };
}

/** Live character count against the length search engines show. */
function Counter({ name, ideal }: { name: string; ideal: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`);
    if (!el) return;
    const update = () => setN(el.value.length);
    update();
    el.addEventListener("input", update);
    return () => el.removeEventListener("input", update);
  }, [name]);
  return <span className={`text-xs tabular-nums ${n > ideal ? "text-amber-700" : "text-graphite"}`}>{n} / {ideal}</span>;
}

export default function ArticleForm({
  article,
  projects,
  categories,
}: {
  article?: ArticleData;
  /** Projects that can be linked from the article. */
  projects: { slug: string; title: string }[];
  /** Categories already in use, offered as suggestions. */
  categories: string[];
}) {
  const [state, action, pending] = useActionState(saveArticle.bind(null, article?.id ?? null), { ok: false, message: "" } as FormState);
  const draft = useFormDraft(`article:${article?.id ?? "new"}`);
  const [initial, setInitial] = useState<Initial>(article ?? EMPTY);
  const [version, setVersion] = useState(0);
  const slugRef = useRef<HTMLInputElement>(null);
  const slugTouched = useRef(Boolean(article));
  const e = state.errors ?? {};

  const { setSaving, recheck } = draft;
  useEffect(() => {
    if (state.message && !state.ok) setSaving(false);
  }, [state, setSaving]);
  useEffect(() => {
    if (version) recheck();
  }, [version, recheck]);

  const submit = submitWith(action);
  const live = article?.published && (!article.publishAt || new Date(article.publishAt) <= new Date());

  return (
    <form ref={draft.formRef} onInput={draft.onInput} onSubmit={(ev) => draft.setSaving(submit(ev))} className="grid gap-6 lg:grid-cols-3">
      {draft.offer && (
        <DraftBanner
          at={formatDraftTime(draft.offer.at)}
          onRestore={() => {
            setInitial(fromEntries(draft.offer!.entries));
            setVersion((v) => v + 1);
          }}
          onDiscard={draft.dismissOffer}
        />
      )}

      <div key={`main-${version}`} className="space-y-6 lg:col-span-2">
        <Card title="Article">
          <Field
            label="Title"
            name="title"
            required
            defaultValue={initial.title}
            error={e.title}
            hint="The headline — also the page title in Google unless a meta title is set."
            onChange={(v) => {
              if (!slugTouched.current && slugRef.current) slugRef.current.value = slugify(v);
            }}
          />
          <div>
            <label className="label" htmlFor="slug">Slug (URL) *</label>
            <input ref={slugRef} id="slug" name="slug" defaultValue={initial.slug} className="field" required onChange={() => (slugTouched.current = true)} />
            {e.slug ? <p className="mt-1 text-xs text-red-700">{e.slug[0]}</p> : <p className="mt-1 text-xs text-graphite">/journal/your-slug — short, with the words people search for.</p>}
          </div>
          <Field
            label="Excerpt"
            name="excerpt"
            textarea
            rows={3}
            defaultValue={initial.excerpt}
            error={e.excerpt}
            hint="One or two sentences shown on the journal page and under the headline."
          />
          <RichTextEditor
            name="content"
            label="Text"
            images
            defaultValue={initial.content}
            error={e.content}
            hint="Use H2 for sections (they become the table of contents) and H3 inside them. “Image” uploads, “Library” reuses an image."
          />
        </Card>

        <Card title="SEO">
          <div>
            <Field label="Meta title" name="seoTitle" defaultValue={initial.seo.title} error={e.seoTitle} hint="Leave empty to use the title." />
            <div className="mt-1 text-right"><Counter name="seoTitle" ideal={60} /></div>
          </div>
          <div>
            <Field label="Meta description" name="seoDescription" textarea rows={3} defaultValue={initial.seo.description} error={e.seoDescription} hint="Leave empty to use the excerpt." />
            <div className="mt-1 text-right"><Counter name="seoDescription" ideal={155} /></div>
          </div>
        </Card>
      </div>

      <div key={`side-${version}`} className="space-y-6">
        <Card title="Publish">
          <Toggle name="published" label="Published" defaultChecked={initial.published} />
          <DateTimeField
            name="publishAt"
            label="Publish date (optional)"
            defaultValue={initial.publishAt}
            hint="Shown on the article. A future date keeps it hidden until then (the site updates within the hour)."
          />
          {e.publishAt && <p className="text-xs text-red-700">{e.publishAt[0]}</p>}
          {state.message && <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>{state.message}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton pending={pending}>{article ? "Save changes" : "Create article"}</SubmitButton>
            <Link href="/admin/articles" className="btn btn-ghost">Cancel</Link>
            {draft.dirty && !pending && <span className="text-xs text-amber-700">Unsaved changes</span>}
          </div>
          {live && (
            <a href={`/journal/${article!.slug}`} target="_blank" className="block text-xs text-bronze hover:underline">View on the site ↗</a>
          )}
        </Card>

        <Card title="Cover image">
          <ImageField name="coverImage" defaultValue={initial.coverImage} aspect="aspect-[16/9]" removable hint="Shown on the journal page, at the top of the article and when the link is shared." />
          {e.coverImage && <p className="text-xs text-red-700">{e.coverImage[0]}</p>}
        </Card>

        <Card title="Details">
          <div>
            <Field label="Category" name="category" defaultValue={initial.category} error={e.category} list="article-categories" hint="e.g. Design guides, Behind the project, Materials." />
            <datalist id="article-categories">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <Field label="Tags" name="tags" defaultValue={initial.tags.join(", ")} error={e.tags} hint="Comma separated, e.g. Kensington, lighting, joinery." />
          <Field label="Author" name="author" defaultValue={initial.author} error={e.author} hint="Leave empty to sign it as the studio." />
        </Card>

        <Card title="Related projects">
          <p className="text-xs text-graphite">Linked at the end of the article, and the article is linked from those project pages.</p>
          <div className="max-h-64 space-y-1.5 overflow-y-auto">
            {projects.map((p) => (
              <label key={p.slug} className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" name="projects" value={p.slug} defaultChecked={initial.projects.includes(p.slug)} />
                {p.title}
              </label>
            ))}
            {!projects.length && <p className="text-xs text-graphite">No projects yet.</p>}
          </div>
          {e.projects && <p className="text-xs text-red-700">{e.projects[0]}</p>}
        </Card>
      </div>
    </form>
  );
}
