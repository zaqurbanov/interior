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
