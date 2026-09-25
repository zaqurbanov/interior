// Phones play the scroll sequences like a video instead of scrubbing them:
// the section is one screen tall and a clock drives the same timeline units
// the scroll position drives on larger screens.

/** Below md (the same breakpoint as the mobile frame <source>). */
export const AUTOPLAY_QUERY = "(max-width: 767px)";

/** Reading time for each stage's copy. */
export const STAGE_HOLD_MS = 2600;

/**
 * Speed while a stage's copy is read. The picture keeps moving slowly instead
 * of stopping, so the sequence never looks frozen.
 */
const SLOW_RATE = 0.3;

/** A stretch of the timeline played at `rate` × normal speed. */
type Zone = { from: number; to: number; rate: number };

/**
 * One slow stretch from each point, lasting about STAGE_HOLD_MS. A stretch
 * runs at most `limit(i)`; if that is short, it plays slower to keep the time.
 */
function slowZones(points: number[], fps: number, limit: (i: number) => number): Zone[] {
  const want = (fps * SLOW_RATE * STAGE_HOLD_MS) / 1000;
  const zones: Zone[] = [];
  points.forEach((from, i) => {
    const len = Math.min(want, limit(i) - from);
    if (len > 0) zones.push({ from, to: from + len, rate: Math.max(0.12, len / ((fps * STAGE_HOLD_MS) / 1000)) });
  });
  return zones;
}

/** Speed at timeline position x: 1 outside the zones, easing in and out over a few frames. */
function rateAt(zones: Zone[], x: number) {
  for (const z of zones) {
    if (x < z.from || x >= z.to) continue;
    const ramp = Math.min(4, (z.to - z.from) / 4);
    // The opening starts slow; later stretches ease down from full speed.
    const edge = Math.min(z.from === 0 ? Infinity : x - z.from, z.to - x) / ramp;
    return edge >= 1 ? z.rate : 1 + (z.rate - 1) * edge;
  }
  return 1;
}

export type Player = { play: () => void; pause: () => void; restart: () => void; destroy: () => void };

/**
 * Advances `unit` from 0 to totalUnits - 1 at `fps` units per second.
 * - slows down for about STAGE_HOLD_MS at each unit in `holds` (and at the
 *   start), so each stage's copy can be read while the picture still moves;
 * - never runs ahead of the frames that have loaded (`ready`), so a slow
 *   connection shows a pause rather than skipped frames;
 * - calls onEnd once at the last unit.
 */
export function createPlayer(opts: {
  totalUnits: number;
  fps: number;
  holds: number[];
  ready: (unit: number) => boolean;
  onUnit: (unit: number) => void;
  onEnd: () => void;
}): Player {
  const last = opts.totalUnits - 1;
  const points = [0, ...opts.holds.filter((h) => h > 0 && h < last).sort((a, b) => a - b)];
  // A stretch ends well before the next stage's copy comes in.
  const zones = slowZones(points, opts.fps, (i) => points[i] + ((points[i + 1] ?? last) - points[i]) * 0.6);
  let unit = 0;
  let playing = false;
  let raf = 0;
  let prev = 0;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(now - (prev || now), 100); // a backgrounded tab must not jump ahead
    prev = now;
    const next = Math.min(unit + (dt * opts.fps * rateAt(zones, unit)) / 1000, last);
    if (!opts.ready(Math.ceil(next))) return; // buffering
    unit = next;
    opts.onUnit(unit);
    if (unit >= last) {
      stop();
      opts.onEnd();
    }
  };

  const stop = () => {
    playing = false;
    cancelAnimationFrame(raf);
  };

  return {
    play() {
      if (playing || unit >= last) return;
      playing = true;
      prev = 0;
      raf = requestAnimationFrame(tick);
    },
    pause: stop,
    restart() {
      stop();
      unit = 0;
      opts.onUnit(0);
      this.play();
    },
    destroy: stop,
  };
}

/** See Segment in lib/project-story.ts. */
type Segment = { frame: number; frames: number; units: number };

/**
 * The phone player for a real video (H.264 of the mobile frames). The video is
 * the clock: its currentTime is mapped back to timeline units, so the stage
 * copy behaves exactly as with frames. Where the timeline holds a frame
 * (between scenes) the video is paused for that long; at each stage it plays
 * slower (playbackRate) for about STAGE_HOLD_MS instead of stopping.
 * `onFail` fires if the browser refuses to play it (e.g. iOS Low Power Mode
 * blocks autoplay) so the caller can fall back to frames.
 */
export function createVideoPlayer(opts: {
  video: HTMLVideoElement;
  fps: number;
  segments: Segment[];
  holds: number[];
  onUnit: (unit: number) => void;
  onEnd: () => void;
  onFail: () => void;
}): Player {
  const { video, fps, segments } = opts;
  const bases: number[] = [];
  let totalUnits = 0;
  for (const s of segments) {
    bases.push(totalUnits);
    totalUnits += s.units;
  }
  const last = totalUnits - 1;

  const frameToUnit = (f: number) => {
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      if (s.frames > 1 && f >= s.frame && f < s.frame + s.frames) return bases[i] + (f - s.frame);
    }
    return f <= 0 ? 0 : last;
  };

  // Where to stop the video: frame holds (units animate on while stopped).
  type Stop = { time: number; unit: number; units: number; ms: number };
  const queue: Stop[] = segments
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.frames === 1)
    .map(({ s, i }) => ({ time: (s.frame + 0.5) / fps, unit: bases[i], units: s.units, ms: (s.units / fps) * 1000 }));
  const opening: Stop = { time: 0, unit: 0, units: 0, ms: 0 };

  // Where to slow down, in video frames: at each stage (and the start). A stage
  // that begins on a held frame slows the footage right after the hold instead.
  const points: { frame: number; end: number; next: number }[] = [];
  for (const h of [0, ...opts.holds.filter((h) => h > 0 && h < last).sort((a, b) => a - b)]) {
    let i = segments.findIndex((s, k) => h >= bases[k] && h < bases[k] + s.units);
    let u = h;
    if (segments[i]?.frames === 1) u = bases[++i];
    const s = segments[i];
    if (!s) continue;
    points.push({ frame: s.frame + (u - bases[i]), end: s.frame + s.frames - 1, next: Infinity });
  }
  points.forEach((p, i) => (p.next = points[i + 1]?.frame ?? p.end));
  const zones = slowZones(
    points.map((p) => p.frame),
    fps,
    (i) => Math.min(points[i].end, points[i].frame + (points[i].next - points[i].frame) * 0.6),
  );

  let mode: "stopped" | "playing" | "ended" = "stopped";
  let current = opening;
  let next = 0;
  let stoppedAt = 0;
  let elapsed = 0;
  let active = false;
  let raf = 0;

  const start = () => void video.play().catch(() => opts.onFail());

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (mode === "stopped") {
      const t = now - stoppedAt;
      const moving = current.units ? (current.units / fps) * 1000 : 0;
      opts.onUnit(current.unit + (moving ? Math.min(1, t / moving) * current.units : 0));
      if (t >= current.ms) {
        mode = "playing";
        start();
      }
    } else if (mode === "playing") {
      const stop = queue[next];
      if (stop && video.currentTime >= stop.time) {
        video.pause();
        current = stop;
        next++;
        mode = "stopped";
        stoppedAt = now;
        opts.onUnit(stop.unit);
      } else {
        const frame = video.currentTime * fps;
        const rate = Math.round(rateAt(zones, frame) * 20) / 20;
        if (video.playbackRate !== rate) video.playbackRate = rate;
        opts.onUnit(frameToUnit(frame));
      }
    }
  };

  const onEnded = () => {
    mode = "ended";
    cancelAnimationFrame(raf);
    opts.onUnit(last);
    opts.onEnd();
  };
  const onError = () => opts.onFail();
  video.addEventListener("ended", onEnded);
  video.addEventListener("error", onError);

  const player: Player = {
    play() {
      if (active || mode === "ended") return;
      active = true;
      if (mode === "stopped") stoppedAt = performance.now() - elapsed;
      else start();
      raf = requestAnimationFrame(tick);
    },
    pause() {
      if (!active) return;
      active = false;
      cancelAnimationFrame(raf);
      if (mode === "stopped") elapsed = performance.now() - stoppedAt;
      else if (mode === "playing") video.pause();
    },
    restart() {
      cancelAnimationFrame(raf);
      video.pause();
      video.currentTime = 0;
      video.playbackRate = 1;
      mode = "stopped";
      current = opening;
      next = 0;
      elapsed = 0;
      active = false;
      opts.onUnit(0);
      player.play();
    },
    destroy() {
      cancelAnimationFrame(raf);
      video.pause();
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
    },
  };
  return player;
}
