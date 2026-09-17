// Scroll-driven walkthroughs for individual projects (frames from videos/*.mp4,
// extracted by scripts/extract-project-frames.mjs).

export type StoryStage = {
  /** Timeline unit where this stage starts. */
  at: number;
  eyebrow: string;
  title: string;
  text: string;
  /** Right-hand column. */
  label: string;
  facts: string[];
};

export type ProjectStory = {
  slug: string;
  /** Frame-set version; bump together with scripts/extract-project-frames.mjs. */
  version: number;
  /** Frames per scene, in order. */
  scenes: number[];
  /** Pause (in frames) held between two scenes. */
  hold: number;
  /** Height of the scroll section, in vh. */
  scrollVh: number;
  stages: StoryStage[];
};

export const projectStories: Record<string, ProjectStory> = {
  "villa-la-belle": {
    slug: "villa-la-belle",
    version: 2,
    // Two videos, every 2nd frame (see scripts/extract-project-frames.mjs):
    // scene 1 = arrival & garage, scene 2 = interior.
    scenes: [120, 120],
    hold: 15,
    scrollVh: 650,
    stages: [
      {
        at: 0,
        eyebrow: "The approach",
        title: "Arriving at the villa",
        text: "The drive climbs through Mediterranean planting to a stone façade and a garage dug into the rock — four cars, won back from the hillside.",
        label: "Site & access",
        facts: ["Cap Ferrat peninsula, east of Nice", "≈30 m height difference across the plot", "Underground car park for four cars"],
      },
      {
        at: 62,
        eyebrow: "The architecture",
        title: "Stone, timber and Mediterranean planting",
        text: "Local stone, timber gates and mature planting anchor the villa in the hillside, with the pool and barbecue terrace above the house.",
        label: "Architecture",
        facts: ["Natural stone façades", "Multi-level gardens and terraces", "Pool and barbecue terrace above"],
      },
      {
        at: 140,
        eyebrow: "Inside",
        title: "Staircase, light and lift",
        text: "A sculptural stair wraps the glazed lift shaft under a curved, back-lit ceiling — the heart of the plan and its main source of daylight.",
        label: "Interior architecture",
        facts: ["Curved, back-lit ceiling", "Marble-clad spiral staircase", "Glazed lift to every floor"],
      },
      {
        at: 190,
        eyebrow: "Living spaces",
        title: "Rooms facing the sea",
        text: "Several living rooms, a kitchen and a dining area open onto the terraces, designed in a neoclassical style with modern elements.",
        label: "Interior design",
        facts: ["Two master suites, two guest suites", "Fireplace and bespoke joinery", "Neoclassical with modern elements"],
      },
      {
        at: 232,
        eyebrow: "The result",
        title: "£2,500,000 of construction, seen before it began",
        text: "The whole villa was visualised and animated before work started, so the owners could walk through the house while it was still a drawing.",
        label: "Our scope",
        facts: ["3D visualisation & animation", "Interior design and FF&E", "Full construction drawings"],
      },
    ],
  },
};

export function getProjectStory(slug: string): ProjectStory | null {
  return projectStories[slug] ?? null;
}

export function storyTimeline(story: ProjectStory) {
  const totalFrames = story.scenes.reduce((n, f) => n + f, 0);
  const holds = story.scenes.length - 1;
  return { totalFrames, totalUnits: totalFrames + holds * story.hold };
}

/** Global frame index (0-based across scenes) shown at a timeline unit. */
export function storyUnitToFrame(story: ProjectStory, unit: number) {
  const { totalFrames, totalUnits } = storyTimeline(story);
  let u = Math.round(Math.min(Math.max(unit, 0), totalUnits - 1));
  let frameBase = 0;
  for (let i = 0; i < story.scenes.length; i++) {
    const frames = story.scenes[i];
    if (u < frames) return frameBase + u;
    u -= frames;
    frameBase += frames;
    if (i < story.scenes.length - 1) {
      if (u < story.hold) return frameBase - 1; // paused on the last frame
      u -= story.hold;
    }
  }
  return totalFrames - 1;
}

export function storyFrameUrl(story: ProjectStory, globalIndex: number, set: "desktop" | "mobile") {
  let index = globalIndex;
  for (let i = 0; i < story.scenes.length; i++) {
    if (index < story.scenes[i]) {
      return `/frames/${story.slug}/v${story.version}/scene${i + 1}/${set}/${String(index + 1).padStart(4, "0")}.webp`;
    }
    index -= story.scenes[i];
  }
  return storyPosterUrl(story);
}

export function storyPosterUrl(story: ProjectStory) {
  return `/frames/${story.slug}/v${story.version}/poster.webp`;
}
