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
    scenes: [240, 240, 240],
    hold: 30,
    scrollVh: 1400,
    // Timeline: scene 1 = arrival & garage, scene 2 = gardens & pool, scene 3 = interior.
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
        at: 255,
        eyebrow: "The gardens",
        title: "Terraces cut into the hillside",
        text: "Multi-level gardens step down around the house, with olive, cypress and palm planting framing the villa from every terrace.",
        label: "Landscape",
        facts: ["Multi-level Mediterranean gardens", "Stone paving and planted terraces", "Outdoor lounge and dining areas"],
      },
      {
        at: 400,
        eyebrow: "The pool",
        title: "Water, stone and sunlight",
        text: "The outdoor pool sits above the house, with the barbecue terrace a few metres higher and an observatory at the top of the hill.",
        label: "Outdoor living",
        facts: ["Outdoor swimming pool", "Barbecue terrace above the pool", "Observatory at the summit"],
      },
      {
        at: 560,
        eyebrow: "Inside",
        title: "Staircase, light and lift",
        text: "A sculptural stair wraps the glazed lift shaft under a curved, back-lit ceiling — the heart of the plan and its main source of daylight.",
        label: "Interior architecture",
        facts: ["Curved, back-lit ceiling", "Marble-clad spiral staircase", "Glazed lift to every floor"],
      },
      {
        at: 655,
        eyebrow: "Living spaces",
        title: "Rooms facing the sea",
        text: "Several living rooms, a kitchen and a dining area open onto the terraces, designed in a neoclassical style with modern elements.",
        label: "Interior design",
        facts: ["Two master suites, two guest suites", "Fireplace and bespoke joinery", "Neoclassical with modern elements"],
      },
      {
        at: 740,
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
      return `/frames/${story.slug}/scene${i + 1}/${set}/${String(index + 1).padStart(4, "0")}.webp`;
    }
    index -= story.scenes[i];
  }
  return `/frames/${story.slug}/poster.webp`;
}
