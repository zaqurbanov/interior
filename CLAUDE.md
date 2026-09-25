# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Marketing site for a London interior-design / 3D-visualisation studio ("Vladimir - Fasij", legal name A&V Interiors Ltd), rebuilt from vladimir-fasij.com. Next.js 15 App Router + MongoDB + an admin panel. Its defining feature is scroll-scrubbed video: MP4s are pre-split into WebP frame sequences and drawn to a `<canvas>` whose frame index is driven by scroll position.

## Commands

```bash
npm run dev                              # dev server (port 3000)
npm run build                            # production build — run this before claiming a change is safe
npx tsc --noEmit                         # type check (~20s; see the Mongoose note below)
node scripts/extract-frames.mjs          # home-page frames from video.mp4 + video2.mp4 (npm run frames)
node scripts/extract-project-frames.mjs  # per-project walkthrough frames from videos/*.mp4
node scripts/import-source.mjs           # re-import text + images from vladimir-fasij.com
node scripts/build-mobile-videos.mjs     # phone MP4s from the mobile frames (rerun after any frame change)
```

There are no tests and no lint config beyond `next lint`. The frame and video scripts need `ffmpeg` on PATH (or `FFMPEG=/path`) and are run manually, not during build.

Never run `next build` while a dev server is running on the same checkout — both use `.next`, and the dev server then throws `__webpack_modules__ is not a function` / `self is not defined` until it is restarted.

## Task tracking

Tasks are written in Azerbaijani, one Markdown file per task:

- `tasks/<slug>.md` — open tasks; `TASKS.md` is their index (per section: title, one-line summary, link) and holds the file template.
- `tasks-archive/<slug>.md` — finished tasks; `tasks-archive/README.md` is their index, newest first within each section.
- `docs/vacib-qeydler.md` — standing notes and decisions, not tasks.

When a task is finished: `git mv` its file to `tasks-archive/`, set `Status: bitib` with the date and PR, and move its index line from `TASKS.md` to `tasks-archive/README.md`. A new task gets a file in `tasks/` and a line in `TASKS.md`.

## Environment

Copy `.env.example` to `.env.local`: `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (seed only), `NEXT_PUBLIC_SITE_URL`, `BLOB_READ_WRITE_TOKEN`, and optionally `RESEND_API_KEY` / `MAIL_FROM` / `NOTIFY_EMAIL` for enquiry emails. Without `MONGODB_URI` the public site still renders — see the fallback below — but admin login and the contact form fail.

## Architecture

### Content: DB with a code fallback

`src/lib/data.ts` is the only content entry point for public pages. Every getter runs through `withDb()`, which returns the hard-coded content in `src/lib/defaults.ts` when `MONGODB_URI` is unset or the database is unreachable, so the site never renders empty. `defaults.ts` is generated content: it reads `src/lib/source-content.json` (written by `scripts/import-source.mjs` — projects, team, service images, showreel) and layers editorial metadata (locations, cleaned titles, featured order) on top.

Admin pages deliberately bypass `data.ts` getters and query the Mongoose models directly, so a database problem surfaces as an error instead of silently showing default content.

Mongoose documents are converted to plain objects (`toProject`, `toService`, `toMessage`, `mergeSite`) before crossing into components. `mergeSite` fills missing hero stages from defaults, because the scroll timeline needs one stage per `STAGE_AT` entry.

### Mongoose typing constraint

`src/models/index.ts` declares document interfaces by hand and creates each model inline. Do not reintroduce `InferSchemaType`, and never cast a `Schema<T>` to `Schema` (directly or via a generic helper) — that structural comparison exhausts the TypeScript checker and the build dies with `SIGKILL` on Vercel.

### Scroll sequences

Two components, same technique, separate configs:

- Home: `src/components/scroll/RoomSequence.tsx` + `src/lib/sequence.ts` — two scenes (empty room → furnished, then a walk-in), a hold between them, 8 text stages and a right-hand detail card (`STAGE_DETAILS`).
- Project pages: `src/components/scroll/ProjectStory.tsx` + `src/lib/project-story.ts` — per-slug walkthroughs with copy on the left and facts on the right. Rendered only when `public/frames/<slug>/` exists (checked in `projects/[slug]/page.tsx`).

Both map scroll progress → timeline "unit" → global frame index, preload frames scene by scene, and pick a `desktop`/`mobile` frame set from viewport × DPR. Drawing goes through `src/lib/canvas-frame.ts`: frames are plain `<img>` decoded ahead of use (never `ImageBitmap` — a few hundred bitmaps pin gigabytes), each draw is coalesced into one `requestAnimationFrame`, and only one frame is drawn — do not cross-fade neighbouring frames, which reads as motion blur when scrubbing slowly. Smoothness comes from frame density instead: keep sequences at roughly 150–300 frames (`fps` in the extract script) and give each frame ~2–3vh of scroll. Phones do not scrub: below `md` (`AUTOPLAY_QUERY`) the section is one `svh` screen (`SCROLL_SECTION_CLASS`) and `createPlayer()` (`src/lib/autoplay.ts`) drives the same timeline units by time — at the footage fps, holding `STAGE_HOLD_MS` once each stage's copy has faded in, never running ahead of loaded frames (which load in `linearOrder` instead of `progressiveOrder`), playing only while 40% of the section is visible, and ending on the last frame with a Replay button. On phones the frames are not downloaded at all: both components play an H.264 of the mobile frames (`public/frames/<slug>/v<n>/mobile.mp4`, `/frames/home/v1/mobile.mp4`; built by `scripts/build-mobile-videos.mjs`, 0.6–2 MB instead of 3–11 MB) through `createVideoPlayer()`, where the video's `currentTime` is the clock and pauses implement the timeline's holds. If the video errors or autoplay is refused (iOS Low Power Mode) they fall back to the frame player. Overlay updates live outside the effects so both paths share them. Frame paths are served with a one-year immutable cache header (`next.config.ts`), so project frame URLs carry a version segment (`/frames/<slug>/v<n>/…`): **bump `version` in both `project-story.ts` and `extract-project-frames.mjs` whenever frames change**, or viewers keep the old ones.

Stage positions are frame numbers, so they must be re-tuned whenever a video, its frame `step`, or the scene list changes.

Loading and fallbacks (`src/lib/frame-loader.ts`), shared by both components:

- Frame 0 is rendered server-side as a `<picture>` (`fetchPriority="high"`, mobile `<source>`) under the canvas. It is the page's LCP element and what crawlers see; the canvas fades in over it after its first draw.
- Everything after frame 0 waits for `whenReadyToStream` (page `load` + idle, or the section coming within 1.5 viewports), then loads in `progressiveOrder` — every 8th frame, then 4th, 2nd, rest — so the whole sequence is scrubbable early and sharpens as it fills.
- `prefersLiteMedia()` (reduced motion, Data Saver, 2G) swaps the animation for the still frame plus every stage as plain text.
- New project stories can omit `scrollVh`: `storyScrollVh` derives it from the footage length (`fps`, default 24) at 40vh per second, so all walkthroughs share one pace. Existing hand-tuned values are kept on purpose.
- Browser automation tabs run hidden: `img.decode()`, idle callbacks and rAF stall there, so a sequence that looks stuck in a hidden tab usually starts the moment the tab is visible.

### Project galleries

`ShowcaseGallery` shows six selected images in a size rhythm (entrance tween plus a slow parallax drift inside each frame); everything else sits behind "View all N photos". The fullscreen `Lightbox` is where the gallery is actually browsed: it morphs out of the clicked tile, has a thumbnail rail, keyboard arrows, grab/drag navigation and a cursor-following magnifier (mouse only; it maps the pointer onto the object-contain box, so it stays accurate at any window size). Lightbox state lives in `useLightbox` (`src/components/site/use-lightbox.tsx`).

Tailwind v4 gives `button` `cursor: default`, so interactive tiles need an explicit `cursor-pointer`.

### Scroll, transitions and reveals

The layout persists across client navigation, which breaks anything set up only on mount:

- `SmoothScroll.tsx` (Lenis + GSAP ticker) resets Lenis's cached scroll position and height on every navigation — without it a new page opens at its footer and hash links land short — and skips that reset on back/forward so restored positions survive.
- `Reveal.tsx` re-runs per pathname and reveals elements already on or above the screen. Animation is a CSS transition on `[data-revealed]`, not GSAP, so content can't stay invisible when rAF is throttled.
- `PageTransition.tsx` shows the VF wordmark overlay between pages; `SkeletonImage.tsx` is the branded placeholder for every content image.

### Admin

Auth is NextAuth v5 credentials (`src/auth.ts`) with an edge-safe config (`src/auth.config.ts`) used by `src/middleware.ts`, which guards `/admin/*`. Mutations are server actions in `src/app/actions/admin.ts`, validated with Zod (`src/lib/validators.ts`) and followed by `revalidatePath("/", "layout")`.

Admin forms submit through `submitWith()` (`src/components/admin/fields.tsx`) instead of a plain `action` prop, so React does not reset the form and lose input when validation fails.

Project and service forms also use `useFormDraft()` (`src/components/admin/use-form-draft.ts`): edits are mirrored to localStorage and offered back on the next visit, and leaving with unsaved edits asks first. There is deliberately no server autosave. Inputs whose value changes in code (uploads, pickers, the editor, the date field) fire a bubbling `input` event through `useNotifyChange()` so the form notices; a new one must do the same. Pass `DndContext` a `useId()` id, or dnd-kit's aria ids break hydration.

Descriptions are HTML from a Tiptap editor, sanitised on save and on render by `src/lib/rich-text.ts`; older plain-text content (blank-line paragraphs) still renders through the same `toHtml()`. Projects have `highlights` (≤6 starred gallery images shown on the page), `publishAt` (scheduling — public getters filter with `liveProjectQuery()`, so a scheduled project appears within the 1h ISR window) and `previewToken` (`/api/preview/<token>` enables draft mode plus a cookie; the project page reads cookies only in draft mode, so it stays static). The admin list sets `order` by drag and drop; new projects are appended.

The database is MongoDB Atlas (database name from `MONGODB_DB`, default `vladimir-fasij` — set in `connectDB`, because Atlas URIs usually omit it). `npm run seed` (`scripts/seed.ts`) inserts missing default content and the admin account and never overwrites edited records; `npm run seed -- --reset-admin` sets the admin password. It refuses the `.env.example` placeholder credentials.

Uploads never pass through a server action (Vercel rejects bodies over 4.5 MB). The browser shrinks each image (`src/lib/upload-client.ts`: longest edge 2560px, WebP; the social-sharing image 1200px JPEG), then `/api/admin/upload` either hands it a one-off Vercel Blob client token (`BLOB_READ_WRITE_TOKEN` set) or takes the file itself and writes `public/uploads` (local development / a future self-hosted server; refused on Vercel). The route is outside `/admin`, so it checks the session itself. Forms then carry only URLs (hidden inputs from `ImageField` / `GalleryField` in `src/components/admin/ImageUpload.tsx`), validated by `isAllowedImageUrl` — uploads or files shipped under `/images`. `submitWith()` refuses to save while an upload is still running.

Enquiries (`/admin/messages`, the `Message` model) carry a pipeline `status` (`src/lib/enquiries.ts`; `spam` is hidden unless filtered for), `tags` and timestamped `notes`; filters live in the URL and `enquiryQuery()` serves both the list and the CSV export (`/api/admin/enquiries/export`, session-checked, formula-escaped). The contact action (`src/app/actions/contact.ts`) drops honeypot and too-fast submissions silently, rate-limits by a salted IP hash (3 per 10 min, 10 per day), files link-stuffed messages as spam, and sends the studio alert and the client receipt through Resend (`src/lib/mail.ts`) in `after()`, so mail problems never block the form. Client components that call server actions must catch rejections (expired session, database down) — an uncaught one replaces the page with the error boundary.

The media library (`/admin/media`, `Media` model) keys metadata — alt text, size, dimensions — by URL; content documents keep plain URL strings, so nothing was migrated. `listLibrary()` merges registered uploads with every URL the content refers to, and public pages read alt text through `getImageAlts()`, falling back to a generated description. Because one library image can be used in several places, saves and deletes remove a stored file only through `deleteIfUnused()` (`src/lib/media.ts`).

### Styling

Tailwind v4 with semantic tokens in `src/app/globals.css`: `ivory` = page ground, `sand` = raised surface, `ink` = foreground, `graphite` = secondary text, `bronze` = accent, `line` = borders. The palette is dark (black ground, white text), matching the original site. The `.admin-light` wrapper on `src/app/admin/layout.tsx` redefines the same tokens light for the panel. The `font-serif` utility is mapped to Chillax (self-hosted in `src/fonts`), the original site's display face; body text is Inter.

## Known gaps

- `public/frames` and `public/images` are ~175 MB of committed assets; adding more project walkthroughs will grow the repo fast. Hosting stays on Vercel for the foreseeable future (a later move is the client's call), so the frames should eventually move to Vercel Blob as well (admin uploads already use it). See `TASKS.md`.
