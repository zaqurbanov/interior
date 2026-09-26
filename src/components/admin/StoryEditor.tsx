"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createStory, deleteStory, saveStoryContent } from "@/app/actions/stories";
import { storyFrameUrl, storyTimeline, storyUnitToFrame, type ProjectStory } from "@/lib/project-story";
import type { StoryAdminData } from "@/lib/types";
import type { FormState } from "@/lib/validators";
import { Card } from "./fields";

type Stage = StoryAdminData["stages"][number];

/** Server actions throw on an expired session; keep the page alive and say so. */
const call = (p: Promise<FormState>): Promise<FormState> =>
  p.catch((e: Error) => ({ ok: false, message: e.message === "Unauthorized" ? "Your session has expired — sign in again." : e.message }));

function Status({ state }: { state: FormState | null }) {
  if (!state?.message) return null;
  return <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`} role="status">{state.message}</p>;
}

/* ---------------- Timeline ---------------- */

let uid = 0;

/** Shows a frame without flashing blank while the next one loads. */
function FrameImage({ src }: { src: string }) {
  const [shown, setShown] = useState(src);
  const latest = useRef(src);
  useEffect(() => {
    latest.current = src;
    const img = new Image();
    img.onload = () => latest.current === src && setShown(src);
    img.src = src;
  }, [src]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={shown} alt="" className="absolute inset-0 h-full w-full object-cover" />;
}

function TimelineCard({ projectId, story, slug }: { projectId: string; story: StoryAdminData; slug: string }) {
  const router = useRouter();
  const [stages, setStages] = useState<(Stage & { key: string })[]>(() => story.stages.map((s) => ({ ...s, key: `t${uid++}` })));
  const [hold, setHold] = useState(story.hold);
  const [enabled, setEnabled] = useState(story.enabled);
  const [unit, setUnit] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [state, setState] = useState<FormState | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();

  const timeline: ProjectStory = useMemo(
    () => ({ slug, version: story.version, base: story.base, fps: story.fps, hold, scenes: story.scenes, pauses: story.pauses, stages: [] }),
    [slug, story.version, story.base, story.fps, story.scenes, story.pauses, hold],
  );
  const { totalUnits } = storyTimeline(timeline);
  const last = Math.max(0, totalUnits - 1);
  const frame = storyUnitToFrame(timeline, unit);
  const sorted = [...stages].sort((a, b) => a.at - b.at);
  const current = sorted.filter((s) => s.at <= unit).pop();

  const edit = (fn: (l: typeof stages) => typeof stages) => {
    setStages(fn);
    setDirty(true);
  };
  const patch = (key: string, p: Partial<Stage>) => edit((l) => l.map((s) => (s.key === key ? { ...s, ...p } : s)));

  // Warm the cache with every 3rd phone frame so scrubbing is instant.
  useEffect(() => {
    let cancelled = false;
    const urls = Array.from({ length: Math.ceil(storyTimeline(timeline).totalFrames / 3) }, (_, i) => storyFrameUrl(timeline, i * 3, "mobile"));
    (async () => {
      for (const u of urls) {
        if (cancelled) return;
        await new Promise((r) => {
          const img = new Image();
          img.onload = img.onerror = r;
          img.src = u;
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [timeline]);

  // Play: step through units at the footage frame rate.
  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => setUnit((u) => (u >= last ? (setPlaying(false), u) : u + 1)), 1000 / story.fps);
    return () => window.clearInterval(t);
  }, [playing, last, story.fps]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const addStage = () => {
    const key = `t${uid++}`;
    edit((l) => [...l, { key, at: unit, eyebrow: "", title: "", text: "", label: "", facts: [] }]);
    setSelected(key);
  };

  const save = () =>
    start(async () => {
      const res = await call(
        saveStoryContent(projectId, { enabled, hold, stages: sorted.map(({ key: _k, ...s }) => ({ ...s, facts: s.facts.filter(Boolean) })) }),
      );
      setState(res);
      if (res.ok) {
        setDirty(false);
        router.refresh();
      }
    });

  return (
    <Card title="Timeline and copy">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-3">
          {/* Preview, roughly as on the site */}
          <div className="relative aspect-video overflow-hidden rounded bg-black">
            <FrameImage src={storyFrameUrl(timeline, frame, "mobile")} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-black/60" />
            {current && (
              <div className="absolute inset-x-4 bottom-4 max-w-[60%] text-white">
                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-[#c4a47f]">{current.eyebrow}</p>
                <p className="mt-1 font-serif text-xl leading-tight">{current.title || "Untitled stage"}</p>
                <p className="mt-1 line-clamp-2 text-xs text-white/75">{current.text}</p>
              </div>
            )}
            {current && current.facts.length > 0 && (
              <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 text-right text-[0.65rem] text-white sm:block">
                <p className="uppercase tracking-widest text-white/60">{current.label}</p>
                {current.facts.slice(0, 4).map((f) => (
                  <p key={f}>{f}</p>
                ))}
              </div>
            )}
          </div>

          {/* Scrubber with stage markers */}
          <div className="relative pt-5">
            {sorted.map((s, i) => (
              <button
                key={s.key}
                type="button"
                title={s.title || `Stage ${i + 1}`}
                onClick={() => {
                  setUnit(s.at);
                  setSelected(s.key);
                }}
                style={{ left: `${(s.at / Math.max(1, last)) * 100}%` }}
                className={`absolute top-0 grid h-4 w-4 -translate-x-1/2 cursor-pointer place-items-center rounded-full text-[0.55rem] ${
                  selected === s.key ? "bg-ink text-ivory" : "bg-bronze text-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <input
              type="range"
              min={0}
              max={last}
              value={unit}
              onChange={(e) => {
                setPlaying(false);
                setUnit(Number(e.target.value));
              }}
              className="w-full accent-[#1b1a18]"
              aria-label="Timeline position"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button type="button" onClick={() => setUnit((u) => Math.max(0, u - 1))} className="btn btn-ghost px-3 py-1" aria-label="Previous frame">←</button>
            <button type="button" onClick={() => setPlaying((p) => !p)} className="btn btn-ghost px-3 py-1">{playing ? "Pause" : "Play"}</button>
            <button type="button" onClick={() => setUnit((u) => Math.min(last, u + 1))} className="btn btn-ghost px-3 py-1" aria-label="Next frame">→</button>
            <span className="tabular-nums text-graphite">
              Position {unit} / {last} · frame {frame + 1}
            </span>
            <button type="button" onClick={addStage} className="btn ml-auto px-3 py-1">+ Stage here</button>
          </div>
          {story.scenes.length > 1 && (
            <label className="flex items-center gap-2 text-sm text-graphite">
              Pause between scenes
              <input
                type="number"
                min={0}
                max={240}
                value={hold}
                onChange={(e) => {
                  setHold(Math.max(0, Number(e.target.value)));
                  setDirty(true);
                }}
                className="field w-20 py-1"
              />
              positions (desktop scroll; phones hold the frame for as long)
            </label>
          )}
        </div>

        {/* Stages */}
        <ol className="space-y-3">
          {sorted.map((s, i) => {
            const open = selected === s.key;
            return (
              <li key={s.key} className={`rounded-md border p-3 text-sm ${open ? "border-ink/40" : "border-black/5"}`}>
                <button type="button" onClick={() => setSelected(open ? null : s.key)} className="flex w-full cursor-pointer items-baseline gap-2 text-left">
                  <span className="text-xs text-graphite">{i + 1}.</span>
                  <span className="flex-1 font-medium">{s.title || "Untitled stage"}</span>
                  <span className="text-xs tabular-nums text-graphite">@ {s.at}</span>
                </button>
                {open && (
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => patch(s.key, { at: i === 0 ? 0 : unit })} disabled={i === 0} className="btn btn-ghost px-2.5 py-1 text-xs">
                        {i === 0 ? "Opening stage (starts at 0)" : `Move to current position (${unit})`}
                      </button>
                      <button type="button" onClick={() => setUnit(s.at)} className="btn btn-ghost px-2.5 py-1 text-xs">Show</button>
                      <button type="button" onClick={() => edit((l) => l.filter((x) => x.key !== s.key))} className="ml-auto cursor-pointer text-xs text-red-700 hover:underline">
                        Delete
                      </button>
                    </div>
                    <input value={s.eyebrow} onChange={(e) => patch(s.key, { eyebrow: e.target.value })} placeholder="Eyebrow (small line above)" className="field py-1.5" />
                    <input value={s.title} onChange={(e) => patch(s.key, { title: e.target.value })} placeholder="Title *" className="field py-1.5" />
                    <textarea value={s.text} onChange={(e) => patch(s.key, { text: e.target.value })} rows={3} placeholder="Text" className="field py-1.5" />
                    <input value={s.label} onChange={(e) => patch(s.key, { label: e.target.value })} placeholder="Right column heading (desktop)" className="field py-1.5" />
                    <textarea
                      value={s.facts.join("\n")}
                      onChange={(e) => patch(s.key, { facts: e.target.value.split("\n") })}
                      rows={3}
                      placeholder="Right column facts, one per line"
                      className="field py-1.5"
                    />
                  </div>
                )}
              </li>
            );
          })}
          {!sorted.length && <li className="text-sm text-graphite">No stages yet — move the slider and press “+ Stage here”.</li>}
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-black/5 pt-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => {
              setEnabled(e.target.checked);
              setDirty(true);
            }}
            className="h-4 w-4 accent-[#1b1a18]"
          />
          Show on the project page
        </label>
        <button type="button" disabled={pending} onClick={save} className="btn">{pending ? "Saving…" : "Save"}</button>
        {dirty && !pending && <span className="text-xs text-amber-700">Unsaved changes</span>}
        <Status state={state} />
      </div>
    </Card>
  );
}

/* ---------------- Page ---------------- */

export default function StoryEditor({
  projectId,
  projectTitle,
  slug,
  story,
  hasBuiltIn,
}: {
  projectId: string;
  projectTitle: string;
  slug: string;
  story: StoryAdminData | null;
  hasBuiltIn: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [state, setState] = useState<FormState | null>(null);

  if (!story && !hasBuiltIn) {
    return (
      <Card title="Walkthrough">
        <p className="text-sm text-graphite">
          {projectTitle} has no walkthrough yet. Walkthroughs are made on a computer from the project video (frames and the phone video,
          then an entry in the code) — see <code>docs/animasiya-yaratmaq.md</code>. Once it is on the site, its text and timing can be edited here.
        </p>
      </Card>
    );
  }

  if (!story) {
    return (
      <Card title="Walkthrough">
        <p className="text-sm text-graphite">
          {projectTitle} has a walkthrough. Start editing to change its copy, stage positions and timing here.
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await call(createStory(projectId));
                setState(res);
                if (res.ok) router.refresh();
              })
            }
            className="btn"
          >
            Edit the walkthrough
          </button>
          <Status state={state} />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className={`rounded-full px-2 py-0.5 text-xs ${story.enabled && story.version ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
          {story.enabled && story.version ? "Live on the project page" : hasBuiltIn ? "Hidden — the built-in walkthrough shows" : "Hidden"}
        </span>
        <Link href={`/projects/${slug}`} target="_blank" className="text-bronze hover:underline">View page ↗</Link>
      </div>

      {story.version > 0 ? (
        <TimelineCard key={`tl-${story.version}`} projectId={projectId} story={story} slug={slug} />
      ) : (
        <Card title="Timeline and copy">
          <p className="text-sm text-graphite">This walkthrough has no frames. Remove it below; walkthroughs are made on a computer (docs/animasiya-yaratmaq.md).</p>
        </Card>
      )}

      <div className="flex items-center gap-4 text-sm">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            confirm(hasBuiltIn ? "Remove the edited walkthrough and go back to the built-in one?" : "Delete this walkthrough, its videos and frames?") &&
            start(async () => {
              const res = await call(deleteStory(projectId));
              setState(res);
              if (res.ok) router.refresh();
            })
          }
          className="cursor-pointer text-red-700 hover:underline"
        >
          {hasBuiltIn ? "Discard edits (use the built-in walkthrough)" : "Delete walkthrough"}
        </button>
        <Status state={state} />
      </div>
    </div>
  );
}
