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
  /**
   * Extra scroll spent standing still on a frame, so copy can be read while the
   * picture holds. `at` is a global frame index, `units` the length of the pause.
   */
  pauses?: { at: number; units: number }[];
  /** Height of the scroll section, in vh. */
  scrollVh: number;
  stages: StoryStage[];
};

export const projectStories: Record<string, ProjectStory> = {
  cannes: {
    slug: "cannes",
    version: 2,
    // One scene at 15fps: the camera drops from an aerial view to the pool
    // terrace (first 6.5s of the clip).
    scenes: [98],
    hold: 0,
    scrollVh: 350,
    stages: [
      {
        at: 0,
        eyebrow: "From above",
        title: "A villa in the hills above Cannes",
        text: "Eight hundred square metres set into sun-drenched hillside gardens, with the pool terrace cut into the slope beside the house.",
        label: "The property",
        facts: ["800 sq.m private villa", "Hills near Cannes, France", "€3,000,000 refurbishment"],
      },
      {
        at: 36,
        eyebrow: "The descent",
        title: "Down to the façade",
        text: "The camera drops through the pines to the elevation: shuttered windows, balconies and the stone steps down to the water.",
        label: "Architecture",
        facts: ["Traditional French Riviera elevation", "Balconies and shaded terraces", "Landscape designed with the house"],
      },
      {
        at: 66,
        eyebrow: "The pool",
        title: "Where the day is spent",
        text: "The pool area was designed as the centre of the property — loungers, planting and a terrace that runs the length of the villa.",
        label: "Outdoor living",
        facts: ["Pool and sun terrace", "Shaded lounge areas", "Planting that frames the view"],
      },
      {
        at: 86,
        eyebrow: "Our scope",
        title: "Modern comfort, traditional French warmth",
        text: "Every room and every terrace was modelled and rendered in 3ds Max, so the owners could walk the finished house before the refurbishment began.",
        label: "Delivery",
        facts: ["3D visualisation in 3ds Max", "Interior and landscape design", "Full set of project visuals"],
      },
    ],
  },
  "albert-mews": {
    slug: "albert-mews",
    version: 3,
    // One scene: the garden and pool (Albert2.mp4 from 2s to 8s, 24fps).
    scenes: [144],
    hold: 0,
    scrollVh: 380,
    stages: [
      {
        at: 0,
        eyebrow: "The setting",
        title: "A garden that feels like the countryside",
        text: "The house is wrapped in mature greenery that gives it privacy and quiet — the feeling of being far out of town, while still in the middle of a dynamic city.",
        label: "The house",
        facts: ["Romford, London", "600 sq.m family house", "Neoclassical interior"],
      },
      {
        at: 42,
        eyebrow: "Outdoor living",
        title: "Pool, terrace and barbecue",
        text: "Exterior spaces were designed and visualised alongside the house: the pool and its terrace, the barbecue zone and the car park.",
        label: "Exterior scope",
        facts: ["Pool and terrace", "Barbecue zone", "Car park and guest house"],
      },
      {
        at: 84,
        eyebrow: "The extension",
        title: "More room for a young family",
        text: "The extension enlarged the kitchen, added a storeroom and opened up a spacious living room, with a 7 sq.m conservatory for exotic plants.",
        label: "Interior changes",
        facts: ["Porch integrated into the hall", "Larger bathroom and dressing room", "7 sq.m conservatory"],
      },
      {
        at: 122,
        eyebrow: "Our scope",
        title: "Modelled in 3ds Max, drawn in AutoCAD",
        text: "Photo-realistic visuals of every interior in the main and guest houses, plus the full drawing set and finishes schedule needed for tendering.",
        label: "Delivery",
        facts: ["3ds Max and Corona Renderer", "Full CAD set and finishes schedule", "Four-month programme"],
      },
    ],
  },
  "villa-la-belle": {
    slug: "villa-la-belle",
    version: 4,
    // Two videos at 15fps (see scripts/extract-project-frames.mjs):
    // scene 1 = arrival & garage, scene 2 = interior.
    scenes: [150, 150],
    hold: 20,
    scrollVh: 720,
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
        at: 78,
        eyebrow: "The architecture",
        title: "Stone, timber and Mediterranean planting",
        text: "Local stone, timber gates and mature planting anchor the villa in the hillside, with the pool and barbecue terrace above the house.",
        label: "Architecture",
        facts: ["Natural stone façades", "Multi-level gardens and terraces", "Pool and barbecue terrace above"],
      },
      {
        at: 175,
        eyebrow: "Inside",
        title: "Staircase, light and lift",
        text: "A sculptural stair wraps the glazed lift shaft under a curved, back-lit ceiling — the heart of the plan and its main source of daylight.",
        label: "Interior architecture",
        facts: ["Curved, back-lit ceiling", "Marble-clad spiral staircase", "Glazed lift to every floor"],
      },
      {
        at: 240,
        eyebrow: "Living spaces",
        title: "Rooms facing the sea",
        text: "Several living rooms, a kitchen and a dining area open onto the terraces, designed in a neoclassical style with modern elements.",
        label: "Interior design",
        facts: ["Two master suites, two guest suites", "Fireplace and bespoke joinery", "Neoclassical with modern elements"],
      },
      {
        at: 292,
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

type Segment = { frame: number; frames: number; units: number };

const timelines = new WeakMap<ProjectStory, { totalFrames: number; totalUnits: number; segments: Segment[] }>();

/**
 * Flattens a story into segments of play (1 unit per frame) and pause (frames
 * stand still) so scroll can run fast between the moments that carry copy.
 */
function buildTimeline(story: ProjectStory) {
  const cached = timelines.get(story);
  if (cached) return cached;

  const totalFrames = story.scenes.reduce((n, f) => n + f, 0);
  const pauses = [...(story.pauses ?? [])].sort((a, b) => a.at - b.at);
  const segments: Segment[] = [];
  let frame = 0;

  const play = (to: number) => {
    if (to > frame) segments.push({ frame, frames: to - frame, units: to - frame });
    frame = Math.max(frame, to);
  };
  const pause = (at: number, units: number) => {
    if (units > 0) segments.push({ frame: at, frames: 1, units });
  };

  let sceneEnd = 0;
  story.scenes.forEach((frames, i) => {
    sceneEnd += frames;
    for (const p of pauses) {
      if (p.at >= frame && p.at < sceneEnd) {
        play(p.at);
        pause(p.at, p.units);
      }
    }
    play(sceneEnd);
    if (i < story.scenes.length - 1) pause(sceneEnd - 1, story.hold);
  });

  const totalUnits = segments.reduce((n, s) => n + s.units, 0);
  const entry = { totalFrames, totalUnits, segments };
  timelines.set(story, entry);
  return entry;
}

export function storyTimeline(story: ProjectStory) {
  const { totalFrames, totalUnits } = buildTimeline(story);
  return { totalFrames, totalUnits };
}

/** Global frame index (0-based across scenes) shown at a timeline unit. */
export function storyUnitToFrame(story: ProjectStory, unit: number) {
  const { totalFrames, totalUnits, segments } = buildTimeline(story);
  let u = Math.round(Math.min(Math.max(unit, 0), totalUnits - 1));
  for (const seg of segments) {
    if (u < seg.units) return seg.frames > 1 ? seg.frame + u : seg.frame;
    u -= seg.units;
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
