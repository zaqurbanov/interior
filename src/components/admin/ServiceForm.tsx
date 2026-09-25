"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveService } from "@/app/actions/admin";
import ServiceIcon, { serviceIconNames } from "@/components/site/ServiceIcon";
import type { ServiceData } from "@/lib/types";
import type { FormState } from "@/lib/validators";
import { Card, Field, SubmitButton, Toggle, submitWith } from "./fields";
import { ImageField } from "./ImageUpload";

export default function ServiceForm({ service }: { service?: ServiceData }) {
  const [state, action, pending] = useActionState(saveService.bind(null, service?.id ?? null), { ok: false, message: "" } as FormState);
  const [icon, setIcon] = useState(service?.icon || "cube");
  const e = state.errors ?? {};

  return (
    <form onSubmit={submitWith(action)} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card title="Details">
          <Field label="Title" name="title" required defaultValue={service?.title} error={e.title} />
          <Field label="Slug (URL)" name="slug" required defaultValue={service?.slug} error={e.slug} hint="/services/your-slug — lowercase letters, numbers, hyphens" />
          <Field label="Summary" name="summary" textarea rows={3} defaultValue={service?.summary} error={e.summary} />
          <Field label="Description" name="content" textarea rows={10} defaultValue={service?.content} error={e.content} hint="Separate paragraphs with a blank line." />
          <Field label="Key points" name="features" textarea rows={5} defaultValue={service?.features.join("\n")} error={e.features} hint="One point per line." />
        </Card>
        <Card title="Image">
          <ImageField name="image" defaultValue={service?.image} aspect="aspect-[21/9]" removable />
          {e.image && <p className="text-xs text-red-700">{e.image[0]}</p>}
        </Card>
        <Card title="SEO">
          <Field label="Meta title" name="seoTitle" defaultValue={service?.seo.title} error={e.seoTitle} hint="Leave empty to use “Title in London”." />
          <Field label="Meta description" name="seoDescription" textarea rows={3} defaultValue={service?.seo.description} error={e.seoDescription} />
        </Card>
      </div>
      <div className="space-y-6">
        <Card title="Publish">
          <Toggle name="published" label="Published" defaultChecked={service?.published ?? true} />
          <Field label="Order" name="order" type="number" defaultValue={service?.order ?? 0} error={e.order} />
          {state.message && <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>{state.message}</p>}
          <div className="flex gap-3">
            <SubmitButton pending={pending}>{service ? "Save changes" : "Create service"}</SubmitButton>
            <Link href="/admin/services" className="btn btn-ghost">Cancel</Link>
          </div>
        </Card>
        <Card title="Icon">
          <input type="hidden" name="icon" value={icon} />
          <div className="grid grid-cols-4 gap-2">
            {serviceIconNames.map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setIcon(n)}
                aria-label={n}
                aria-pressed={icon === n}
                className={`grid aspect-square place-items-center rounded border ${icon === n ? "border-ink bg-ink text-ivory" : "border-black/10"}`}
              >
                <ServiceIcon name={n} className="h-6 w-6" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </form>
  );
}
