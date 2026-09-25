import { BUILTIN_VIDEO_DATE, storyMobileVideoUrl, storyPosterUrl, storyTimeline, type ProjectStory } from "./project-story";
import { HOME_FPS, HOME_VIDEO, TOTAL_FRAMES } from "./sequence";
import { framesUrl } from "./frames-base";

// schema.org VideoObject for Google's video results. Google needs name,
// description, thumbnailUrl and uploadDate; contentUrl (a file) or embedUrl
// (a player) tells it what to show. All URLs must be absolute.

type Ctx = { siteUrl: string };

const abs = (u: string, { siteUrl }: Ctx) => (/^https?:\/\//.test(u) ? u : `${siteUrl}${u}`);

/** Seconds → ISO 8601 duration ("PT18S", "PT1M4S"). */
const isoDuration = (seconds: number) => {
  const s = Math.max(1, Math.round(seconds));
  return `PT${s >= 60 ? `${Math.floor(s / 60)}M` : ""}${s % 60 ? `${s % 60}S` : ""}`;
};

/** A walkthrough: the phone MP4 is a real file, so Google can index the video itself. */
export function storyVideo(story: ProjectStory, info: { name: string; description: string; pageUrl: string }, ctx: Ctx) {
  const { totalFrames } = storyTimeline(story);
  return {
    "@type": "VideoObject",
    name: info.name,
    description: info.description,
    thumbnailUrl: [abs(storyPosterUrl(story), ctx)],
    contentUrl: abs(storyMobileVideoUrl(story), ctx),
    uploadDate: story.uploadDate || BUILTIN_VIDEO_DATE,
    duration: isoDuration(totalFrames / (story.fps ?? 24)),
    url: info.pageUrl,
  };
}

/** The home-page sequence (scene1 + scene2). */
export function homeVideo(info: { name: string; description: string }, ctx: Ctx) {
  return {
    "@type": "VideoObject",
    name: info.name,
    description: info.description,
    thumbnailUrl: [abs(framesUrl("poster.webp"), ctx)],
    contentUrl: abs(HOME_VIDEO, ctx),
    uploadDate: BUILTIN_VIDEO_DATE,
    duration: isoDuration(TOTAL_FRAMES / HOME_FPS),
    url: ctx.siteUrl,
  };
}

/**
 * A YouTube/Vimeo video ("youtube:ID" / "vimeo:ID") embedded on the page.
 * Vimeo has no predictable thumbnail URL, so the caller's image stands in.
 */
export function embedVideo(
  video: string,
  info: { name: string; description: string; uploadDate?: string; thumbnail?: string; pageUrl: string },
  ctx: Ctx,
) {
  const [provider, id] = video.split(":");
  if (!id || (provider !== "youtube" && provider !== "vimeo")) return null;
  const youtube = provider === "youtube";
  const thumbnail = youtube ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : info.thumbnail && abs(info.thumbnail, ctx);
  if (!thumbnail) return null;
  return {
    "@type": "VideoObject",
    name: info.name,
    description: info.description,
    thumbnailUrl: [thumbnail],
    embedUrl: youtube ? `https://www.youtube.com/embed/${id}` : `https://player.vimeo.com/video/${id}`,
    uploadDate: info.uploadDate || BUILTIN_VIDEO_DATE,
    url: info.pageUrl,
  };
}
