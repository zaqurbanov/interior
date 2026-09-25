// Scroll timeline for the hero sequence: scene1 frames, a pause on the
// finished room, then scene2 frames. Positions are in "units" (1 unit = 1 frame).

export const SCENES = [
  { dir: "scene1", frames: 192 },
  { dir: "scene2", frames: 240 },
] as const;

/** Pause on the last frame of scene1 before scene2 starts. */
export const HOLD_UNITS = 36;

export const SCENE1_FRAMES = SCENES[0].frames;
export const TOTAL_FRAMES = SCENES[0].frames + SCENES[1].frames;
export const TOTAL_UNITS = TOTAL_FRAMES + HOLD_UNITS;
/** Unit where scene2 begins. */
export const SCENE2_START = SCENE1_FRAMES + HOLD_UNITS;

/** Phones play this instead of the frames; bump with HOME_VERSION in scripts/build-mobile-videos.mjs. */
export const HOME_VIDEO = "/frames/home/v1/mobile.mp4";
/** Frame rate of the home footage and of HOME_VIDEO. */
export const HOME_FPS = 24;

/** The same timeline as segments (see Segment in project-story.ts), for the video player. */
export const HOME_SEGMENTS = [
  { frame: 0, frames: SCENE1_FRAMES, units: SCENE1_FRAMES },
  { frame: SCENE1_FRAMES - 1, frames: 1, units: HOLD_UNITS },
  { frame: SCENE1_FRAMES, frames: SCENES[1].frames, units: SCENES[1].frames },
];

/** Unit at which each text stage starts; the last stage runs to the end. */
export const STAGE_AT = [0, 55, 105, 150, 184, 250, 335, 420];
export const STAGE_COUNT = STAGE_AT.length;

/** Side-card details shown for each stage (same order as STAGE_AT). */
export const STAGE_DETAILS: { service: string; href: string; points: string[] }[] = [
  { service: "Architecture & Landscaping", href: "/services/architecture-landscaping", points: ["Client brief & budget", "Survey of the existing space", "Concept feasibility"] },
  { service: "Interior Design", href: "/services/interior-design", points: ["Space planning & zoning", "Layout and flow", "Mood & material direction"] },
  { service: "Furniture & FF&E", href: "/services/furniture-ffe", points: ["Pieces from the world's best brands", "Bespoke joinery & furniture", "Premium lighting fixtures"] },
  { service: "Interior Design", href: "/services/interior-design", points: ["Fabrics, finishes & colours", "Lighting design", "Finishes schedules"] },
  { service: "3D Visualisation", href: "/services/3d-visualisation", points: ["Photo-realistic renders", "One visual language for all stakeholders", "Concept to final presentation"] },
  { service: "3D Animation & VR", href: "/services/3d-animation", points: ["Virtual walk-throughs", "Immersive 360° & VR tours", "Sell your project faster"] },
  { service: "CAD Drawings", href: "/services/cad-drawings", points: ["Bespoke joinery details", "Wall elevations", "Lighting, electrical & MEP layouts"] },
  { service: "Full project delivery", href: "/contact", points: ["Coordination with contractors", "FF&E supply & installation", "From concept to completion"] },
];

/** Total height of the scroll section, in vh. */
export const SCROLL_VH = 1000;

export type FrameSet = "desktop" | "mobile";

/** Global frame index (0-based, scene1 then scene2) shown at a timeline unit. */
export function unitToFrame(unit: number) {
  const u = Math.round(Math.min(Math.max(unit, 0), TOTAL_UNITS - 1));
  if (u < SCENE1_FRAMES) return u;
  if (u < SCENE2_START) return SCENE1_FRAMES - 1;
  return u - HOLD_UNITS;
}

export function frameUrl(globalIndex: number, set: FrameSet) {
  const scene = globalIndex < SCENE1_FRAMES ? SCENES[0] : SCENES[1];
  const local = globalIndex < SCENE1_FRAMES ? globalIndex : globalIndex - SCENE1_FRAMES;
  return `/frames/${scene.dir}/${set}/${String(local + 1).padStart(4, "0")}.webp`;
}
