// Phones play the scroll sequences like a video instead of scrubbing them:
// the section is one screen tall and a clock drives the same timeline units
// the scroll position drives on larger screens.

/** Below md (the same breakpoint as the mobile frame <source>). */
export const AUTOPLAY_QUERY = "(max-width: 767px)";

/** Pause at each stage long enough to read its copy. */
export const STAGE_HOLD_MS = 2600;

export type Player = { play: () => void; pause: () => void; restart: () => void; destroy: () => void };

/**
 * Advances `unit` from 0 to totalUnits - 1 at `fps` units per second.
 * - stops for STAGE_HOLD_MS at each unit in `holds` (and before starting);
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
  const holds = [...opts.holds].filter((h) => h > 0 && h < last).sort((a, b) => a - b);
  let unit = 0;
  let playing = false;
  let raf = 0;
  let prev = 0;
  let holdUntil = 0;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(now - (prev || now), 100); // a backgrounded tab must not jump ahead
    prev = now;
    if (now < holdUntil) return;
    let next = Math.min(unit + (dt * opts.fps) / 1000, last);
    const hold = holds.find((h) => unit < h && next >= h);
    if (hold !== undefined) {
      next = hold;
      holdUntil = now + STAGE_HOLD_MS;
    }
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
      // Give the opening copy its reading time too.
      if (unit === 0 && !holdUntil) holdUntil = performance.now() + STAGE_HOLD_MS * 0.6;
      raf = requestAnimationFrame(tick);
    },
    pause: stop,
    restart() {
      stop();
      unit = 0;
      holdUntil = 0;
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
 * (between scenes, or to read a stage) the video is paused for that long.
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

  // Where to stop the video: frame holds (units animate on while stopped) and stage holds.
  type Stop = { time: number; unit: number; units: number; ms: number };
  const stops = new Map<number, Stop>();
  const addStop = (frame: number, unit: number, units: number, ms: number) => {
    const time = (frame + 0.5) / fps;
    const s = stops.get(frame) ?? { time, unit, units: 0, ms: 0 };
    s.unit = Math.min(s.unit, unit);
    s.units += units;
    s.ms += ms;
    stops.set(frame, s);
  };
  segments.forEach((s, i) => s.frames === 1 && addStop(s.frame, bases[i], s.units, (s.units / fps) * 1000));
  for (const h of opts.holds) {
    if (h <= 0 || h >= last) continue;
    const i = segments.findIndex((s, k) => h >= bases[k] && h < bases[k] + s.units);
    const s = segments[i];
    if (!s) continue;
    if (s.frames === 1) addStop(s.frame, bases[i], 0, STAGE_HOLD_MS);
    else addStop(s.frame + (h - bases[i]), h, 0, STAGE_HOLD_MS);
  }
  const queue = [...stops.values()].sort((a, b) => a.time - b.time);
  // The opening copy gets its reading time before anything moves.
  const opening: Stop = { time: 0, unit: 0, units: 0, ms: STAGE_HOLD_MS * 0.6 };

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
        opts.onUnit(frameToUnit(video.currentTime * fps));
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
