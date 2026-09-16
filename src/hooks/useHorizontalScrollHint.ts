import { useCallback, useEffect, useRef, useState } from 'react';

export type HorizontalScrollHint = {
  /** Content is wider than its box, so there is something to scroll to. */
  scrollable: boolean;
  /** Scrolled away from the left edge. */
  canScrollLeft: boolean;
  /** Not yet at the right edge. */
  canScrollRight: boolean;
};

/** Sub-pixel layout rounding means the ends never land on exactly 0. */
const EDGE_TOLERANCE_PX = 2;

/**
 * Track whether a scroll container has content off-screen horizontally.
 *
 * Wide tables sit in an `overflow-x-auto` box with no visible affordance: every
 * platform this app runs on uses overlay scrollbars, which stay hidden until
 * you already scroll. On a 390px viewport the delegate table is 1,179px wide,
 * so six of its nine columns — including Delegate EAY, the one the page exists
 * to compare — are off-screen with nothing to suggest they are there.
 *
 * Returns flags for each edge rather than one `scrollable` boolean so a fade
 * can be drawn only on the side that still has content, instead of covering an
 * edge the reader has already reached.
 */
export const useHorizontalScrollHint = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [hint, setHint] = useState<HorizontalScrollHint>({
    scrollable: false,
    canScrollLeft: false,
    canScrollRight: false,
  });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const scrollable = maxScroll > EDGE_TOLERANCE_PX;

    setHint((prev) => {
      const next = {
        scrollable,
        canScrollLeft: scrollable && el.scrollLeft > EDGE_TOLERANCE_PX,
        canScrollRight:
          scrollable && el.scrollLeft < maxScroll - EDGE_TOLERANCE_PX,
      };

      return prev.scrollable === next.scrollable &&
        prev.canScrollLeft === next.canScrollLeft &&
        prev.canScrollRight === next.canScrollRight
        ? prev
        : next;
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    measure();
    el.addEventListener('scroll', measure, { passive: true });

    // Rows arrive after the first paint and columns can be toggled, so the
    // measurement has to survive both rather than run once on mount.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);

    return () => {
      el.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, [measure]);

  return { ref, ...hint };
};

export default useHorizontalScrollHint;
