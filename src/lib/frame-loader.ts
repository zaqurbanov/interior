// Loading strategy shared by the scroll-scrubbed sequences.

/**
 * Frame indices in coarse-to-fine order: every 8th frame first, then every 4th,
 * every 2nd, and finally the rest. Because the renderer falls back to the
 * nearest loaded frame, the whole sequence becomes scrubbable almost at once
 * and simply gains smoothness as the gaps fill in.
 */
export function progressiveOrder(from: number, to: number): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const stride of [8, 4, 2, 1]) {
    for (let i = from; i < to; i += stride) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/**
 * True when the visitor should get a still image instead of the animation:
 * reduced motion, Data Saver, or a 2G-class connection.
 */
export function prefersLiteMedia(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (connection?.saveData) return true;
  return connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
}

/**
 * Resolves once the page has finished its own loading and the main thread is
 * idle — or earlier, as soon as `near` reports that the visitor is about to
 * reach the sequence. Keeps hundreds of frame requests from competing with the
 * page's own content (and its LCP image) during the initial load.
 */
export function whenReadyToStream(near: Element, signal: { cancelled: boolean }): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done || signal.cancelled) return;
      done = true;
      observer.disconnect();
      resolve();
    };

    const observer = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && finish(), {
      rootMargin: "150% 0px",
    });
    observer.observe(near);

    const idle = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
        .requestIdleCallback;
      if (ric) ric(finish, { timeout: 2500 });
      else window.setTimeout(finish, 300);
    };
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
  });
}

/**
 * On phones a finger flick covers far less of a long section than a mouse
 * wheel, so the desktop runway (1000vh on the home page) turns into minutes of
 * swiping. Below the md breakpoint the pinned screen keeps its 100vh and the
 * scrub part shrinks to this share. Progress is relative to the section
 * height, so stage timing is unchanged — it just goes by faster.
 */
const MOBILE_RUNWAY = 0.45;

export const mobileScrollVh = (desktopVh: number) => Math.round(100 + (desktopVh - 100) * MOBILE_RUNWAY);

/**
 * Height of a scroll section: `svh` on phones (fixed, so the collapsing
 * address bar does not resize the section mid-scrub), `vh` from md up.
 * Use with SCROLL_SECTION_CLASS.
 */
export const scrollSectionStyle = (desktopVh: number) =>
  ({ "--scroll-vh": desktopVh, "--scroll-vh-mobile": mobileScrollVh(desktopVh) }) as React.CSSProperties;

export const SCROLL_SECTION_CLASS = "h-[calc(var(--scroll-vh-mobile)*1svh)] md:h-[calc(var(--scroll-vh)*1vh)]";
