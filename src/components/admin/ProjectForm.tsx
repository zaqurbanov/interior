"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { saveProject } from "@/app/actions/admin";
import type { ProjectData } from "@/lib/types";
import type { FormState } from "@/lib/validators";
import { Card, Field, SubmitButton, Toggle, submitWith } from "./fields";
import { GalleryField, ImageField } from "./ImageUpload";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function ProjectForm({ project }: { project?: ProjectData }) {
  const [state, action, pending] = useActionState(saveProject.bind(null, project?.id ?? null), { ok: false, message: "" } as FormState);
  const slugRef = useRef<HTMLInputElement>(null);
  const slugTouched = useRef(Boolean(project));
  const e = state.errors ?? {};

  return (
    <form onSubmit={submitWith(action)} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card title="Details">
          <Field
            label="Title"
            name="title"
            required
            defaultValue={project?.title}
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
              defaultValue={project?.slug}
              className="field"
              required
              onChange={() => (slugTouched.current = true)}
            />
            {e.slug ? <p className="mt-1 text-xs text-red-700">{e.slug[0]}</p> : <p className="mt-1 text-xs text-graphite">/projects/your-slug</p>}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Location" name="location" defaultValue={project?.location} error={e.location} />
            <Field label="Scope / category" name="category" defaultValue={project?.category} error={e.category} />
            <Field label="Year" name="year" defaultValue={project?.year} error={e.year} />
          </div>
          <Field label="Subtitle" name="subtitle" defaultValue={project?.subtitle} error={e.subtitle} />
          <Field label="Summary" name="summary" textarea rows={3} defaultValue={project?.summary} error={e.summary} />
          <Field label="Description" name="content" textarea rows={10} defaultValue={project?.content} error={e.content} hint="Separate paragraphs with a blank line." />
        </Card>

        <Card title="Gallery">
          <GalleryField name="gallery" defaultValue={project?.gallery} />
          {e.gallery && <p className="text-xs text-red-700">{e.gallery[0]}</p>}
        </Card>

        <Card title="Videos">
          <Field
            label="Videos"
            name="videos"
            textarea
            rows={3}
            defaultValue={project?.videos.join("\n")}
            error={e.videos}
            hint="One per line: youtube:VIDEO_ID or vimeo:VIDEO_ID"
          />
        </Card>

        <Card title="SEO">
          <Field label="Meta title" name="seoTitle" defaultValue={project?.seo.title} error={e.seoTitle} hint="Leave empty to use “Title, Location”." />
          <Field label="Meta description" name="seoDescription" textarea rows={3} defaultValue={project?.seo.description} error={e.seoDescription} hint="Leave empty to use the summary. ~155 characters is ideal." />
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Publish">
          <Toggle name="published" label="Published" defaultChecked={project?.published ?? true} />
          <Toggle name="featured" label="Featured on homepage" defaultChecked={project?.featured ?? false} />
          <Field label="Order" name="order" type="number" defaultValue={project?.order ?? 0} error={e.order} />
          {state.message && <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>{state.message}</p>}
          <div className="flex items-center gap-3">
            <SubmitButton pending={pending}>{project ? "Save changes" : "Create project"}</SubmitButton>
            <Link href="/admin/projects" className="btn btn-ghost">Cancel</Link>
          </div>
        </Card>
        <Card title="Cover image">
          <ImageField name="coverImage" defaultValue={project?.coverImage} removable hint="Shown on project cards and at the top of the page." />
          {e.coverImage && <p className="text-xs text-red-700">{e.coverImage[0]}</p>}
        </Card>
      </div>
    </form>
  );
}
