"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { saveService } from "@/app/actions/admin";
import ServiceIcon, { serviceIconNames } from "@/components/site/ServiceIcon";
import type { ServiceData } from "@/lib/types";
import type { FormState } from "@/lib/validators";
import { Card, DraftBanner, Field, SubmitButton, Toggle, submitWith, useNotifyChange } from "./fields";
import { ImageField } from "./ImageUpload";
import RichTextEditor from "./RichTextEditor";
import { formatDraftTime, useFormDraft, type DraftEntries } from "./use-form-draft";

type Initial = Omit<ServiceData, "id">;

const EMPTY: Initial = {
  title: "", slug: "", icon: "cube", image: "", summary: "", content: "", features: [], order: 0, published: true,
  seo: { title: "", description: "" },
};

function fromEntries(entries: DraftEntries): Initial {
  const get = (k: string) => entries.find(([n]) => n === k)?.[1] ?? "";
  return {
    title: get("title"), slug: get("slug"), icon: get("icon") || "cube", image: get("image"), summary: get("summary"),
    content: get("content"), features: get("features").split(/\r?\n/).filter(Boolean), order: Number(get("order")) || 0,
    published: get("published") === "on", seo: { title: get("seoTitle"), description: get("seoDescription") },
  };
}

function IconPicker({ defaultValue }: { defaultValue: string }) {
  const [icon, setIcon] = useState(defaultValue);
  const notify = useNotifyChange(icon);
  return (
    <>
      <input ref={notify} type="hidden" name="icon" value={icon} />
      <div className="grid grid-cols-4 gap-2">
        {serviceIconNames.map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => setIcon(n)}
            aria-label={n}
            aria-pressed={icon === n}
            className={`grid aspect-square cursor-pointer place-items-center rounded border ${icon === n ? "border-ink bg-ink text-ivory" : "border-black/10"}`}
          >
            <ServiceIcon name={n} className="h-6 w-6" />
          </button>
        ))}
      </div>
    </>
  );
}

export default function ServiceForm({ service }: { service?: ServiceData }) {
  const [state, action, pending] = useActionState(saveService.bind(null, service?.id ?? null), { ok: false, message: "" } as FormState);
  const draft = useFormDraft(`service:${service?.id ?? "new"}`);
  const [initial, setInitial] = useState<Initial>(service ? { ...service, icon: service.icon || "cube" } : EMPTY);
  const [version, setVersion] = useState(0);
  const e = state.errors ?? {};

  const { setSaving, recheck } = draft;
  useEffect(() => {
    if (state.message && !state.ok) setSaving(false);
  }, [state, setSaving]);
  useEffect(() => {
    if (version) recheck();
  }, [version, recheck]);

  const submit = submitWith(action);

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
        <Card title="Details">
          <Field label="Title" name="title" required defaultValue={initial.title} error={e.title} />
          <Field label="Slug (URL)" name="slug" required defaultValue={initial.slug} error={e.slug} hint="/services/your-slug — lowercase letters, numbers, hyphens" />
          <Field label="Summary" name="summary" textarea rows={3} defaultValue={initial.summary} error={e.summary} />
          <RichTextEditor name="content" label="Description" defaultValue={initial.content} error={e.content} />
          <Field label="Key points" name="features" textarea rows={5} defaultValue={initial.features.join("\n")} error={e.features} hint="One point per line." />
        </Card>
        <Card title="Image">
          <ImageField name="image" defaultValue={initial.image} aspect="aspect-[21/9]" removable />
          {e.image && <p className="text-xs text-red-700">{e.image[0]}</p>}
        </Card>
        <Card title="SEO">
          <Field label="Meta title" name="seoTitle" defaultValue={initial.seo.title} error={e.seoTitle} hint="Leave empty to use “Title in London”." />
          <Field label="Meta description" name="seoDescription" textarea rows={3} defaultValue={initial.seo.description} error={e.seoDescription} />
        </Card>
      </div>
      <div key={`side-${version}`} className="space-y-6">
        <Card title="Publish">
          <Toggle name="published" label="Published" defaultChecked={initial.published} />
          <Field label="Order" name="order" type="number" defaultValue={initial.order} error={e.order} />
          {state.message && <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>{state.message}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton pending={pending}>{service ? "Save changes" : "Create service"}</SubmitButton>
            <Link href="/admin/services" className="btn btn-ghost">Cancel</Link>
            {draft.dirty && !pending && <span className="text-xs text-amber-700">Unsaved changes</span>}
          </div>
        </Card>
        <Card title="Icon">
          <IconPicker defaultValue={initial.icon} />
        </Card>
      </div>
    </form>
  );
}
