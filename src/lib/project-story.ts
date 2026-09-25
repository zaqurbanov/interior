// Scroll-driven walkthroughs for individual projects. The stories below are
// the built-in set (frames in public/frames, from scripts/extract-project-frames.mjs);
// stories edited in the admin live in MongoDB (Story model) and take
// precedence — see getStory() in lib/data.ts.

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
  /** Frame rate the frames were extracted at (default 24). */
  fps?: number;
  /**
   * Height of the scroll section, in vh. Leave unset to get the site's standard
   * pace (see storyScrollVh); set it only to tune one project by hand.
   */
  scrollVh?: number;
  stages: StoryStage[];
  /**
   * Where the `<slug>/v<version>/…` folders live: "/frames" (public/, the
   * default) or a Vercel Blob URL for walkthroughs generated from the admin.
   */
  base?: string;
  /** ISO date the current frames/MP4 were made (VideoObject uploadDate). */
  uploadDate?: string;
};

/** When the built-in walkthrough MP4s were published (scripts/build-mobile-videos.mjs). */
export const BUILTIN_VIDEO_DATE = "2026-09-25T00:00:00Z";

const root = (story: ProjectStory) => `${story.base ?? "/frames"}/${story.slug}/v${story.version}`;

export const projectStories: Record<string, ProjectStory> = {
  "cap-d-ail": {
    slug: "cap-d-ail",
    version: 1,
    // Two videos at 15fps: ail1 raises the villa from its foundations to the
    // finished pool front, ail2 drives through the gates at dusk and rises over the estate.
    scenes: [150, 150],
    fps: 15,
    hold: 12,
    scrollVh: 720,
    stages: [
      {
        at: 0,
        eyebrow: "Cap d'Ail, near Monaco",
        title: "Two villas, one estate",
        text: "A dual villa estate designed by a construction company with a portfolio across the South of France — the whole territory transformed on a €20,000,000 budget.",
        label: "The project",
        facts: ["Two villas", "Budget of €20,000,000", "3D visualisation of the estate"],
      },
      {
        at: 60,
        eyebrow: "Frame to façade",
        title: "Built from the ground up",
        text: "Floor by floor the structure takes shape — stone-clad arches below, rendered walls and a terracotta roof above.",
        label: "Architecture",
        facts: ["Stone-clad ground floor", "Terracotta tiled roofs", "Balustraded terraces"],
      },
      {
        at: 115,
        eyebrow: "The pool front",
        title: "Terraces facing the sea",
        text: "Spacious terraces open onto the pool and unrivalled views of the Mediterranean, framed by palms and serene landscaping.",
        label: "Outdoors",
        facts: ["Outdoor pools with bars", "Sea-view terraces", "Mediterranean landscaping"],
      },
      {
        at: 165,
        eyebrow: "The arrival",
        title: "Through the gates at dusk",
        text: "Wrought-iron gates open onto a lit forecourt — privacy and tranquillity from the first step onto the estate.",
        label: "Arrival",
        facts: ["Gated private forecourt", "Landscape lighting", "Garages for both villas"],
      },
      {
        at: 262,
        eyebrow: "The estate",
        title: "Made for the coastal evening",
        text: "Pools, roof terraces with Jacuzzis and fireplaces in sunken majlis — and inside, cigar lounges and wine cellars for lavish entertaining.",
        label: "Leisure",
        facts: ["Roof terraces with Jacuzzis", "Sunken majlis with fireplaces", "Cigar lounge and wine cellar"],
      },
    ],
  },
  windsor: {
    slug: "windsor",
    version: 1,
    // One scene at 24fps in four cuts: gym (0–63), indoor pool (64–127),
    // steam room (128–175), entrance hall (176–239).
    scenes: [240],
    hold: 0,
    stages: [
      {
        at: 0,
        eyebrow: "Windsor, UK",
        title: "Where grandeur meets well-being",
        text: "A multi-million-pound estate on the outskirts of Windsor, designed with the construction company and the architects around a private wellness wing.",
        label: "The project",
        facts: ["Budget of £5,000,000", "Designed with the builders and architects", "Private wellness wing"],
      },
      {
        at: 28,
        eyebrow: "The gym",
        title: "Built for serious training",
        text: "A gym fitted with a professional boxing ring and Pilates reformers, for the fitness needs of the most discerning clientele.",
        label: "Fitness",
        facts: ["Professional boxing ring", "Pilates reformer equipment", "Fully equipped gym"],
      },
      {
        at: 68,
        eyebrow: "The pool hall",
        title: "Light on the water",
        text: "A long indoor pool beneath crystal chandeliers, with a canopy daybed and garden views through tall glazing.",
        label: "Pool",
        facts: ["Indoor swimming pool", "Crystal chandeliers", "Outdoor pool with loungers and bar"],
      },
      {
        at: 132,
        eyebrow: "The spa",
        title: "Steam under a starlit ceiling",
        text: "Steam rooms and saunas beside the pool, and a beauty room offering a full suite of massage therapies.",
        label: "Spa",
        facts: ["Steam rooms and saunas", "Beauty and massage rooms", "Fibre-optic starlit ceiling"],
      },
      {
        at: 182,
        eyebrow: "The hall",
        title: "An estate made for arrivals",
        text: "Arched windows, herringbone floors and chandeliers — and beyond them a Japanese garden with koi ponds and a kitchen garden of berries and vegetables.",
        label: "Estate",
        facts: ["Herringbone timber floors", "Japanese garden with koi ponds", "Kitchen garden"],
      },
    ],
  },
  belgravia: {
    slug: "belgravia",
    version: 1,
    // One scene at 24fps: down the panelled corridor, past the library joinery
    // and on to the marble fireplace.
    scenes: [240],
    hold: 0,
    stages: [
      {
        at: 0,
        eyebrow: "Belgravia, London",
        title: "A home in London's most opulent enclave",
        text: "Design intent drawings for a Belgravia residence — the blueprint for its bespoke furniture, marble bathroom cladding and lighting.",
        label: "The project",
        facts: ["Design intent drawings", "Floor and ceiling plans for five rooms", "Built by one of London's premier contractors"],
      },
      {
        at: 60,
        eyebrow: "The corridor",
        title: "Panelled in dark timber",
        text: "Floor-to-ceiling timber panelling and tall black doors, lit by a quiet rhythm of downlights set into the ceiling.",
        label: "Joinery",
        facts: ["Timber wall panelling", "Full-height doors", "Ceiling and lighting plans"],
      },
      {
        at: 115,
        eyebrow: "The library",
        title: "Joinery drawn to the millimetre",
        text: "Bespoke bookcases and cabinetry set into panelled walls — every piece detailed in drawings and 3D for fabrication.",
        label: "Bespoke furniture",
        facts: ["Bespoke bookcases and TV units", "Wardrobes in every bedroom", "3D visuals for fabrication"],
      },
      {
        at: 180,
        eyebrow: "The drawing room",
        title: "Marble and firelight",
        text: "A carved marble fireplace anchors the room, with wall lights and elevations coordinated with the architect.",
        label: "Details",
        facts: ["Marble fireplace surround", "Wall elevations and sockets", "Coordinated with the architect"],
      },
    ],
  },
  chelsea: {
    slug: "chelsea",
    version: 1,
    // Two videos at 15fps: ch1 crosses the living room into the kitchen,
    // ch2 walks from the bedroom into the travertine bathroom.
    scenes: [150, 150],
    fps: 15,
    hold: 12,
    scrollVh: 720,
    stages: [
      {
        at: 0,
        eyebrow: "Chelsea, London",
        title: "A contemporary apartment, redesigned",
        text: "A complete redesign of a Chelsea apartment — calm, pared-back rooms in a soft pastel palette, finished in natural stone.",
        label: "The project",
        facts: ["Full interior redesign", "Soft pastel palette", "Travertine throughout"],
      },
      {
        at: 40,
        eyebrow: "The living room",
        title: "Soft furnishings, sleek fixtures",
        text: "Deep, tactile seating faces a dark media wall with a linear fireplace and back-lit shelving, framed by full-height linen curtains.",
        label: "Living",
        facts: ["Bespoke media wall", "Linear fireplace", "Silk-effect wall coverings in pastel taupe"],
      },
      {
        at: 88,
        eyebrow: "The kitchen",
        title: "Precision-crafted surfaces",
        text: "Dark timber joinery and a black marble splashback, with state-of-the-art appliances set flush into the cabinetry beside a marble dining table.",
        label: "Kitchen",
        facts: ["Dark timber joinery", "Black marble splashback", "Integrated appliances"],
      },
      {
        at: 165,
        eyebrow: "The bedroom",
        title: "A sanctuary of tranquillity",
        text: "Minimalistic opulence: layered neutrals, soft textiles and daylight filtered through sheer curtains.",
        label: "Bedroom",
        facts: ["Layered neutral textiles", "Full-height windows", "Hidden door to the en-suite"],
      },
      {
        at: 245,
        eyebrow: "The en-suite",
        title: "Wrapped in travertine",
        text: "Travertine walls, a back-lit mirror and a floating timber vanity turn the bathroom into a warm, quiet retreat.",
        label: "Materials",
        facts: ["Travertine walls and floor", "Back-lit mirror", "Floating timber vanity"],
      },
    ],
  },
  "cap-ferrat": {
    slug: "cap-ferrat",
    version: 1,
    // Two videos at 15fps: capferat1 raises the mansion from a bare plot to the
    // finished entrance, capferat2 walks the master bedroom into the bathroom.
    scenes: [150, 150],
    fps: 15,
    hold: 12,
    // Same length as the other two-video walkthroughs.
    scrollVh: 720,
    stages: [
      {
        at: 0,
        eyebrow: "From the ground up",
        title: "A new house on a £70,000,000 estate",
        text: "Designed with the construction company that builds it, the villa was re-planned floor by floor — a reconstruction of more than £20,000,000.",
        label: "The project",
        facts: ["South of France", "New layout on every floor", "Reconstruction over £20,000,000"],
      },
      {
        at: 64,
        eyebrow: "The house takes shape",
        title: "A neoclassical façade",
        text: "Columns, balustrades and a pedimented entrance give the main house its formal symmetry, with a guest house alongside.",
        label: "Architecture",
        facts: ["Neoclassical elevation", "Main house and guest house", "Stone-clad entrance hall"],
      },
      {
        at: 100,
        eyebrow: "The arrival",
        title: "Gardens made for the Riviera",
        text: "The landscape was redesigned with the house: palms and planting to the entrance, a pool with an outdoor kitchen, fountains and a Japanese garden.",
        label: "Landscape",
        facts: ["Pool with outdoor kitchen", "Fountains and Japanese garden", "Direct access to the sea"],
      },
      {
        at: 165,
        eyebrow: "The master suite",
        title: "Crystal, panelling and light",
        text: "One of six new bedrooms and a master suite — panelled walls, a sitting area and crystal chandeliers throughout.",
        label: "Interior",
        facts: ["Six new bedrooms and a master suite", "Crystal chandeliers", "Panelled walls and cornices"],
      },
      {
        at: 228,
        eyebrow: "The bathroom",
        title: "Marble from floor to ceiling",
        text: "The suite opens into a marble bathroom with a freestanding bath beneath the window — the same materials that run through the hall and stair.",
        label: "Materials",
        facts: ["Marble floors and walls", "Freestanding bath", "Onyx-clad cocktail bar downstairs"],
      },
    ],
  },
  "villa-luna-cap-martin": {
    slug: "villa-luna-cap-martin",
    version: 1,
    // Two videos at 15fps: luna1 flies in over the bay to the roof terrace,
    // luna2 is the terrace at sunset and then the library inside.
    scenes: [150, 150],
    fps: 15,
    hold: 12,
    // Same length as the other two-video walkthrough (Villa La Belle).
    scrollVh: 720,
    stages: [
      {
        at: 0,
        eyebrow: "Above the bay",
        title: "A villa that looks over all of Monaco",
        text: "Set on the rocks at Cap Martin, the house faces the bay, the harbour and the lights of the principality across the water.",
        label: "The setting",
        facts: ["Cap Martin, French Riviera", "Views over the whole of Monaco", "Cliff-top plot above the sea"],
      },
      {
        at: 62,
        eyebrow: "The villa",
        title: "White volumes stepped into the rock",
        text: "Each level steps back from the one below, so every floor opens onto its own terrace and its own view of the sea.",
        label: "Architecture",
        facts: ["Clean white modern volumes", "A terrace on every level", "Mediterranean planting on the rock"],
      },
      {
        at: 100,
        eyebrow: "The roof",
        title: "An exclusive escape above it all",
        text: "The roof terrace brings together an outdoor bar, a lounge and a jacuzzi, with a fire pit set within a cosy majlis for the evenings.",
        label: "Roof terrace",
        facts: ["Outdoor bar and lounge", "Jacuzzi with sea views", "Fire pit within a majlis"],
      },
      {
        at: 165,
        eyebrow: "Golden hour",
        title: "Where the day ends",
        text: "Under the planted pergola, low sofas and a glass balustrade keep nothing between the terrace and the sunset over the water.",
        label: "Outdoor living",
        facts: ["Pergola with climbing plants", "Frameless glass balustrade", "Sea-facing lounge"],
      },
      {
        at: 228,
        eyebrow: "The library",
        title: "A quiet room lined with books",
        text: "Inside, dark timber shelving runs floor to ceiling around a reading room — calm and warm, a counterpoint to the bright terraces.",
        label: "Interior",
        facts: ["Floor-to-ceiling timber joinery", "Warm, layered lighting", "Bedrooms and a grand master suite above"],
      },
    ],
  },
  "villa-nudra": {
    slug: "villa-nudra",
    version: 1,
    // One scene at 24fps: the shell-and-core site becomes the finished villa,
    // then the camera passes through the glass into the living room.
    scenes: [240],
    hold: 0,
    stages: [
      {
        at: 0,
        eyebrow: "Shell and core",
        title: "A white canvas on the Gulf coast",
        text: "The villa reached us as a bare concrete frame — the chance to shape a residence entirely around the client, from structure to finishes.",
        label: "The starting point",
        facts: ["Nudra development, Saadiyat Island", "1,350 sq.m private villa", "Handed over as shell and core"],
      },
      {
        at: 64,
        eyebrow: "The façade",
        title: "Jerusalem stone and sleek metal",
        text: "Stone sourced from Jerusalem, paired with slim metal elements, gives the elevation a modern line and a warm, tactile surface.",
        label: "Architecture",
        facts: ["Jerusalem stone cladding", "Slim metal detailing", "Pool terrace facing the sea"],
      },
      {
        at: 112,
        eyebrow: "Inside",
        title: "Light that reaches the lower floor",
        text: "In the garden, a fountain with a glass bottom lets daylight fall straight through into the spa below — the house's signature detail.",
        label: "Signature detail",
        facts: ["Glass-bottomed garden fountain", "Daylit spa beneath", "Floor-to-ceiling glazing"],
      },
      {
        at: 176,
        eyebrow: "Our scope",
        title: "From frame to finished home",
        text: "A £5,000,000 property and a construction budget of about £3,500,000, designed and visualised end to end before work began on site.",
        label: "Delivery",
        facts: ["Interior architecture and design", "Photo-real 3D visualisation", "Tailored to the client's brief"],
      },
    ],
  },
  "villa-at-saadiyat-island": {
    slug: "villa-at-saadiyat-island",
    version: 1,
    // One scene at 24fps: up the marble stair, through the timber door and into
    // the double-height living room.
    scenes: [240],
    hold: 0,
    stages: [
      {
        at: 0,
        eyebrow: "The stair",
        title: "Marble, glass and light",
        text: "White marble treads rise beside a frameless glass balustrade, washed in daylight from the windows above.",
        label: "Materials",
        facts: ["White marble slabs throughout", "Frameless glass balustrade", "Classic wall mouldings"],
      },
      {
        at: 80,
        eyebrow: "The threshold",
        title: "Through the timber doors",
        text: "Full-height walnut doors separate the private stair from the family rooms, so each space keeps its own quiet.",
        label: "Joinery",
        facts: ["Full-height timber doors", "Bespoke hardware", "Silk wallpaper inlays"],
      },
      {
        at: 126,
        eyebrow: "The living room",
        title: "A double-height room for the whole family",
        text: "A spacious majlis and dining for twelve open onto the garden and the sea, with the home cinema and show kitchen alongside.",
        label: "Ground floor",
        facts: ["Majlis with sitting area", "Dining table for twelve", "Home cinema and show kitchen"],
      },
      {
        at: 196,
        eyebrow: "Our scope",
        title: "A £2,000,000 transformation",
        text: "From relocating the pool and redesigning the landscape to every interior — furnished with Baker, Promemoria and Rubelli, lit by Bella Figura.",
        label: "Delivery",
        facts: ["Landscape to interior design", "Master suite with two walk-in wardrobes", "Five individually designed bedrooms"],
      },
    ],
  },
  cannes: {
    slug: "cannes",
    version: 2,
    // One scene at 15fps: the camera drops from an aerial view to the pool
    // terrace (first 6.5s of the clip).
    scenes: [98],
    fps: 15,
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
    fps: 15,
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

/** Scroll runway per second of footage — the site's standard pace. */
const VH_PER_SECOND = 40;

/**
 * Section height in vh: 100vh for the pinned screen plus a fixed amount of
 * scroll per second of footage, so every walkthrough moves at the same speed.
 */
export function storyScrollVh(story: ProjectStory): number {
  if (story.scrollVh) return story.scrollVh;
  const seconds = storyTimeline(story).totalUnits / (story.fps ?? 24);
  return Math.round(100 + seconds * VH_PER_SECOND);
}

/** First frame of the desktop and mobile sets — the LCP image for the page. */
export function storyFirstFrame(story: ProjectStory) {
  return { desktop: storyFrameUrl(story, 0, "desktop"), mobile: storyFrameUrl(story, 0, "mobile") };
}

export function getProjectStory(slug: string): ProjectStory | null {
  return projectStories[slug] ?? null;
}

/** A stretch of the timeline: `frames` > 1 plays them one per unit; 1 holds a frame for `units`. */
export type Segment = { frame: number; frames: number; units: number };

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

/** Timeline segments, for the phone video player (lib/autoplay.ts). */
export const storySegments = (story: ProjectStory): Segment[] => buildTimeline(story).segments;

/** H.264 of the mobile frames that phones play instead (scripts/build-mobile-videos.mjs). */
export const storyMobileVideoUrl = (story: ProjectStory) => `${root(story)}/mobile.mp4`;

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
      return `${root(story)}/scene${i + 1}/${set}/${String(index + 1).padStart(4, "0")}.webp`;
    }
    index -= story.scenes[i];
  }
  return storyPosterUrl(story);
}

export function storyPosterUrl(story: ProjectStory) {
  return `${root(story)}/poster.webp`;
}
