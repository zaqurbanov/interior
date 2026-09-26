"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveSiteContent } from "@/app/actions/admin";
import type { SiteContentData } from "@/lib/types";
import type { FormState } from "@/lib/validators";
import { Card, Field, SubmitButton, submitWith } from "./fields";
import { ImageField } from "./ImageUpload";

const SECTIONS = [
  { id: "brand", label: "Brand & SEO" },
  { id: "stages", label: "Homepage scroll" },
  { id: "about", label: "About & numbers" },
  { id: "process", label: "Process" },
  { id: "team", label: "Team" },
  { id: "contact", label: "Contact & social" },
];

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

let uid = 0;
const withKeys = <T,>(list: T[]) => list.map((item) => ({ key: `r${uid++}`, ...item }));

/** Character count that turns amber past the recommended length. */
function Counter({ value, max }: { value: string; max: number }) {
  const n = value.length;
  return (
    <span className={`text-xs tabular-nums ${n > max ? "text-amber-700" : "text-graphite"}`}>
      {n}/{max}
    </span>
  );
}

function RowButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer text-xs text-graphite underline-offset-2 hover:text-ink hover:underline">
      {children}
    </button>
  );
}

export default function SiteContentForm({ content }: { content: SiteContentData }) {
  const [state, action, pending] = useActionState(saveSiteContent, { ok: false, message: "" } as FormState);
  const e = state.errors ?? {};
  const err = (key: string) => e[key];

  const [seoTitle, setSeoTitle] = useState(content.seo.title);
  const [seoDescription, setSeoDescription] = useState(content.seo.description);

  const [stats, setStats] = useState(() => withKeys(content.stats));
  const [process, setProcess] = useState(() => withKeys(content.process));
  const [team, setTeam] = useState(() => withKeys(content.team));

  // Bring the status message into view after saving.
  const statusRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state.message) statusRef.current?.scrollIntoView({ block: "nearest" });
  }, [state]);

  const siteHost = typeof window === "undefined" ? "vladimir-fasij.com" : window.location.host;

  return (
    <form onSubmit={submitWith(action)} className="space-y-6 pb-28">
      {/* Section jump list */}
      <nav aria-label="Sections" className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-graphite hover:border-black/30 hover:text-ink">
            {s.label}
          </a>
        ))}
      </nav>

      {/* Brand & SEO */}
      <div id="brand" className="grid scroll-mt-6 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Brand">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Brand name" name="brandName" required defaultValue={content.brandName} error={err("brandName")} hint="Shown as the logo, e.g. Vladimir - Fasij" />
              <Field label="Tagline" name="tagline" defaultValue={content.tagline} error={err("tagline")} />
            </div>
          </Card>

          <Card title="Search engines (SEO)">
            <div>
              <div className="flex items-baseline justify-between">
                <label className="label" htmlFor="seo.title">Page title *</label>
                <Counter value={seoTitle} max={TITLE_MAX} />
              </div>
              <input id="seo.title" name="seo.title" className="field" value={seoTitle} onChange={(ev) => setSeoTitle(ev.target.value)} />
              {err("seo.title") ? <p className="mt-1 text-xs text-red-700">{err("seo.title")![0]}</p> : <p className="mt-1 text-xs text-graphite">The homepage title in Google and the browser tab. Aim for 50–60 characters.</p>}
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <label className="label" htmlFor="seo.description">Meta description *</label>
                <Counter value={seoDescription} max={DESCRIPTION_MAX} />
              </div>
              <textarea id="seo.description" name="seo.description" rows={3} className="field" value={seoDescription} onChange={(ev) => setSeoDescription(ev.target.value)} />
              {err("seo.description") ? <p className="mt-1 text-xs text-red-700">{err("seo.description")![0]}</p> : <p className="mt-1 text-xs text-graphite">The grey text under the title in search results. Aim for 120–160 characters.</p>}
            </div>
            <Field label="Keywords" name="seo.keywords" defaultValue={content.seo.keywords} error={err("seo.keywords")} hint="Comma-separated. Search engines give these little weight; the title and description matter more." />

            {/* Search result preview */}
            <div className="rounded-md border border-black/5 bg-[#fafafa] p-4">
              <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-wider text-graphite">Google preview</p>
              <p className="truncate text-xs text-[#4d5156]">{siteHost}</p>
              <p className="truncate text-lg leading-snug text-[#1a0dab]">{seoTitle || "Page title"}</p>
              <p className="line-clamp-2 text-sm text-[#4d5156]">{seoDescription || "Meta description…"}</p>
            </div>
          </Card>
        </div>

        <Card title="Social sharing image">
          <ImageField
            name="seo.ogImage"
            defaultValue={content.seo.ogImage}
            aspect="aspect-[1200/630]"
            prepare={{ maxEdge: 1200, format: "jpeg" }}
            hint="Shown when the site is shared on WhatsApp, Facebook or LinkedIn. Use a 1200 × 630 px image; it is saved as JPEG."
          />
          {err("seo.ogImage") && <p className="text-xs text-red-700">{err("seo.ogImage")![0]}</p>}
        </Card>
      </div>

      {/* Homepage scroll stages */}
      <section id="stages" className="scroll-mt-6 space-y-3">
        <div>
          <h2 className="font-medium">Homepage scroll</h2>
          <p className="text-sm text-graphite">
            The text that appears over the homepage video, one card per stage. Each stage is tied to a moment in the video, so the number of stages is fixed — only the words change.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {content.heroStages.map((stage, i) => (
            <Card key={i} title={i === 0 ? "Stage 1 — opening (page heading)" : `Stage ${i + 1}`}>
              <Field label="Small label" name="stage.eyebrow" defaultValue={stage.eyebrow} error={err(`heroStages.${i}.eyebrow`)} />
              <Field label="Heading" name="stage.title" required defaultValue={stage.title} error={err(`heroStages.${i}.title`)} />
              <Field label="Text" name="stage.text" textarea rows={2} defaultValue={stage.text} error={err(`heroStages.${i}.text`)} />
            </Card>
          ))}
        </div>
      </section>

      {/* About & numbers */}
      <div id="about" className="grid scroll-mt-6 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="About the studio">
            <Field label="Heading" name="aboutTitle" defaultValue={content.aboutTitle} error={err("aboutTitle")} />
            <Field label="Text" name="aboutText" textarea rows={6} defaultValue={content.aboutText} error={err("aboutText")} hint="Separate paragraphs with a blank line." />
          </Card>
          <Card title="Portfolio page">
            <Field label="Introduction" name="portfolioIntro" textarea rows={4} defaultValue={content.portfolioIntro} error={err("portfolioIntro")} />
            <Field label="Showreel video" name="showreel" defaultValue={content.showreel} error={err("showreel")} hint="youtube:VIDEO_ID or vimeo:VIDEO_ID — leave empty to hide the showreel." />
          </Card>
        </div>

        <Card title="Numbers">
          {stats.map((s, i) => (
            <div key={s.key} className="grid grid-cols-[5rem_1fr] items-end gap-2">
              <Field label="Value" name="stat.value" defaultValue={s.value} error={err(`stats.${i}.value`)} />
              <Field label="Label" name="stat.label" defaultValue={s.label} error={err(`stats.${i}.label`)} />
              <div className="col-span-2 -mt-1 text-right">
                <RowButton onClick={() => setStats((l) => l.filter((x) => x.key !== s.key))}>Remove</RowButton>
              </div>
            </div>
          ))}
          {stats.length < 8 && <RowButton onClick={() => setStats((l) => [...l, ...withKeys([{ value: "", label: "" }])])}>+ Add a number</RowButton>}
        </Card>
      </div>

      {/* Process */}
      <section id="process" className="scroll-mt-6">
        <Card title="Process steps">
          <div className="grid gap-4 md:grid-cols-2">
            {process.map((p, i) => (
              <div key={p.key} className="space-y-3 rounded-md border border-black/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-graphite">Step {i + 1}</span>
                  <RowButton onClick={() => setProcess((l) => l.filter((x) => x.key !== p.key))}>Remove</RowButton>
                </div>
                <Field label="Title" name="process.title" defaultValue={p.title} error={err(`process.${i}.title`)} />
                <Field label="Text" name="process.text" textarea rows={2} defaultValue={p.text} error={err(`process.${i}.text`)} />
              </div>
            ))}
          </div>
          {process.length < 8 && <RowButton onClick={() => setProcess((l) => [...l, ...withKeys([{ title: "", text: "" }])])}>+ Add a step</RowButton>}
        </Card>
      </section>

      {/* Team */}
      <section id="team" className="scroll-mt-6">
        <Card title="Team (About page)">
          <div className="grid gap-4 md:grid-cols-2">
            {team.map((m, i) => (
              <div key={m.key} className="grid grid-cols-[6rem_1fr] gap-4 rounded-md border border-black/5 p-4">
                <div>
                  <ImageField name="team.photo" defaultValue={m.photo} aspect="aspect-[3/4]" compact prepare={{ maxEdge: 1200 }} />
                  {err(`team.${i}.photo`) && <p className="mt-1 text-xs text-red-700">{err(`team.${i}.photo`)![0]}</p>}
                </div>
                <div className="space-y-3">
                  <Field label="Name" name="team.name" defaultValue={m.name} error={err(`team.${i}.name`)} />
                  <Field label="Role" name="team.role" defaultValue={m.role} error={err(`team.${i}.role`)} />
                  <Field label="Bio" name="team.bio" textarea rows={3} defaultValue={m.bio} error={err(`team.${i}.bio`)} />
                  <div className="text-right">
                    <RowButton onClick={() => setTeam((l) => l.filter((x) => x.key !== m.key))}>Remove member</RowButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <RowButton onClick={() => setTeam((l) => [...l, ...withKeys([{ name: "", role: "", bio: "", photo: "" }])])}>
            + Add a team member
          </RowButton>
        </Card>
      </section>

      {/* Contact & social */}
      <div id="contact" className="grid scroll-mt-6 gap-6 lg:grid-cols-2">
        <Card title="Contact">
          <Field label="Email" name="contact.email" type="email" required defaultValue={content.contact.email} error={err("contact.email")} />
          <Field label="Phone" name="contact.phone" defaultValue={content.contact.phone} error={err("contact.phone")} />
          <Field label="Address" name="contact.address" defaultValue={content.contact.address} error={err("contact.address")} />
          <Field
            label="WhatsApp"
            name="contact.whatsapp"
            type="tel"
            defaultValue={content.contact.whatsapp}
            error={err("contact.whatsapp")}
            hint="International format, e.g. +44 7931 486888. Shown as a WhatsApp button on phones and project pages; leave empty to hide it."
          />
        </Card>
        <Card title="Social links">
          <Field label="Instagram" name="socials.instagram" type="url" defaultValue={content.socials.instagram} error={err("socials.instagram")} />
          <Field label="LinkedIn" name="socials.linkedin" type="url" defaultValue={content.socials.linkedin} error={err("socials.linkedin")} />
          <Field label="YouTube" name="socials.youtube" type="url" defaultValue={content.socials.youtube} error={err("socials.youtube")} hint="Leave a field empty to hide that icon." />
        </Card>
      </div>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur md:left-60">
        <div className="flex items-center justify-between gap-4 px-5 py-3 md:px-10">
          <p ref={statusRef} role="status" className={`text-sm ${state.ok ? "text-green-700" : state.message ? "text-red-700" : "text-graphite"}`}>
            {state.message || "Changes go live on the site as soon as you save."}
          </p>
          <SubmitButton pending={pending}>Save changes</SubmitButton>
        </div>
      </div>
    </form>
  );
}
