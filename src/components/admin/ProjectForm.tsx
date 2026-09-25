"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { ensurePreviewToken, saveProject } from "@/app/actions/admin";
import { previewPath } from "@/lib/preview";
import type { ProjectData } from "@/lib/types";
import type { FormState } from "@/lib/validators";
import { Card, DateTimeField, DraftBanner, Field, SubmitButton, Toggle, submitWith } from "./fields";
import { GalleryField, ImageField } from "./ImageUpload";
import RichTextEditor from "./RichTextEditor";
import { formatDraftTime, useFormDraft, type DraftEntries } from "./use-form-draft";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

type Initial = Omit<ProjectData, "id" | "order" | "previewToken">;

const EMPTY: Initial = {
  title: "", slug: "", subtitle: "", location: "", category: "", year: "", summary: "", content: "",
  coverImage: "", gallery: [], videos: [], highlights: [], featured: false, published: true, publishAt: "",
  seo: { title: "", description: "" },
};

/** Form values saved by useFormDraft → the shape the fields are rendered from. */
function fromEntries(entries: DraftEntries): Initial {
  const get = (k: string) => entries.find(([n]) => n === k)?.[1] ?? "";
  const all = (k: string) => entries.filter(([n]) => n === k).map(([, v]) => v);
  return {
    title: get("title"), slug: get("slug"), subtitle: get("subtitle"), location: get("location"), category: get("category"),
    year: get("year"), summary: get("summary"), content: get("content"), coverImage: get("coverImage"),
    gallery: all("gallery"), highlights: all("highlights"), videos: get("videos").split(/\r?\n/).filter(Boolean),
    featured: get("featured") === "on", published: get("published") === "on", publishAt: get("publishAt"),
    seo: { title: get("seoTitle"), description: get("seoDescription") },
  };
}

/** Shareable link to the page while it is a draft or scheduled. */
function PreviewLink({ id, token: initialToken }: { id: string; token: string }) {
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const url = token ? `${origin}${previewPath(token)}` : "";

  if (!token) {
    return (
      <button type="button" onClick={() => ensurePreviewToken(id).then(setToken, (e: Error) => window.alert(e.message))} className="cursor-pointer text-xs text-bronze hover:underline">
        Create a preview link
      </button>
    );
  }
  return (
    <div className="space-y-1">
      <p className="label mb-0">Preview link</p>
      <div className="flex gap-2">
        <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="field py-1.5 text-xs" aria-label="Preview link" />
        <button
          type="button"
          className="btn btn-ghost px-3 py-1.5 text-xs"
          onClick={() => navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-graphite">Shows this page even while it is a draft or scheduled. Anyone with the link can open it.</p>
    </div>
  );
}

export default function ProjectForm({ project }: { project?: ProjectData }) {
  const [state, action, pending] = useActionState(saveProject.bind(null, project?.id ?? null), { ok: false, message: "" } as FormState);
  const draft = useFormDraft(`project:${project?.id ?? "new"}`);
  const [initial, setInitial] = useState<Initial>(project ?? EMPTY);
  const [version, setVersion] = useState(0);
  const slugRef = useRef<HTMLInputElement>(null);
  const slugTouched = useRef(Boolean(project));
  const e = state.errors ?? {};

  // A failed save keeps the edits flagged as unsaved.
  const { setSaving, recheck } = draft;
  useEffect(() => {
    if (state.message && !state.ok) setSaving(false);
  }, [state, setSaving]);
  useEffect(() => {
    if (version) recheck();
  }, [version, recheck]);

  const submit = submitWith(action);

  return (
    <form
      ref={draft.formRef}
      onInput={draft.onInput}
      onSubmit={(ev) => draft.setSaving(submit(ev))}
      className="grid gap-6 lg:grid-cols-3"
    >
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
        <Card title="Details">
          <Field
            label="Title"
            name="title"
            required
            defaultValue={initial.title}
            error={e.title}
            onChange={(v) => {
              if (!slugTouched.current && slugRef.current) slugRef.current.value = slugify(v);
            }}
          />
          <div>
            <label className="label" htmlFor="slug">Slug (URL) *</label>
            <input
              ref={slugRef}
              id="slug"
              name="slug"
              defaultValue={initial.slug}
              className="field"
              required
              onChange={() => (slugTouched.current = true)}
            />
            {e.slug ? <p className="mt-1 text-xs text-red-700">{e.slug[0]}</p> : <p className="mt-1 text-xs text-graphite">/projects/your-slug</p>}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Location" name="location" defaultValue={initial.location} error={e.location} />
            <Field label="Scope / category" name="category" defaultValue={initial.category} error={e.category} />
            <Field label="Year" name="year" defaultValue={initial.year} error={e.year} />
          </div>
          <Field label="Subtitle" name="subtitle" defaultValue={initial.subtitle} error={e.subtitle} />
          <Field label="Summary" name="summary" textarea rows={3} defaultValue={initial.summary} error={e.summary} hint="Shown on cards and in search results." />
          <RichTextEditor name="content" label="Description" defaultValue={initial.content} error={e.content} />
        </Card>

        <Card title="Gallery">
          <GalleryField name="gallery" defaultValue={initial.gallery} highlightsName="highlights" defaultHighlights={initial.highlights} />
          {(e.gallery || e.highlights) && <p className="text-xs text-red-700">{(e.gallery ?? e.highlights)![0]}</p>}
        </Card>

        <Card title="Videos">
          <Field
            label="Videos"
            name="videos"
            textarea
            rows={3}
            defaultValue={initial.videos.join("\n")}
            error={e.videos}
            hint="One per line: youtube:VIDEO_ID or vimeo:VIDEO_ID"
          />
        </Card>

        <Card title="SEO">
          <Field label="Meta title" name="seoTitle" defaultValue={initial.seo.title} error={e.seoTitle} hint="Leave empty to use “Title, Location”." />
          <Field label="Meta description" name="seoDescription" textarea rows={3} defaultValue={initial.seo.description} error={e.seoDescription} hint="Leave empty to use the summary. ~155 characters is ideal." />
        </Card>
      </div>

      <div key={`side-${version}`} className="space-y-6">
        <Card title="Publish">
          <Toggle name="published" label="Published" defaultChecked={initial.published} />
          <DateTimeField
            name="publishAt"
            label="Go live on (optional)"
            defaultValue={initial.publishAt}
            hint="A published project stays hidden until then; the site shows it within the hour. Leave empty to go live on save."
          />
          {e.publishAt && <p className="text-xs text-red-700">{e.publishAt[0]}</p>}
          <Toggle name="featured" label="Featured on homepage" defaultChecked={initial.featured} />
          {project && <PreviewLink id={project.id} token={project.previewToken} />}
          {state.message && <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>{state.message}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton pending={pending}>{project ? "Save changes" : "Create project"}</SubmitButton>
            <Link href="/admin/projects" className="btn btn-ghost">Cancel</Link>
            {draft.dirty && !pending && <span className="text-xs text-amber-700">Unsaved changes</span>}
          </div>
        </Card>
        <Card title="Cover image">
          <ImageField name="coverImage" defaultValue={initial.coverImage} removable hint="Shown on project cards and at the top of the page." />
          {e.coverImage && <p className="text-xs text-red-700">{e.coverImage[0]}</p>}
        </Card>
      </div>
    </form>
  );
}
