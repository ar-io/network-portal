import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export type HorizontalScrollHint = {
  /** Content is wider than its box, so there is something to scroll to. */
  scrollable: boolean;
  /** Scrolled away from the left edge. */
  canScrollLeft: boolean;
  /** Not yet at the right edge. */
  canScrollRight: boolean;
  /** Height of a classic scrollbar along the bottom; 0 for overlay scrollbars. */
  scrollbarHeight: number;
  /** Width of a classic vertical scrollbar on the right; 0 when none. */
  scrollbarWidth: number;
};

/** Sub-pixel layout rounding means the ends never land on exactly 0. */
const EDGE_TOLERANCE_PX = 2;

/** How far into the content each edge fades. */
const FADE_PX = 32;

/**
 * A mask that fades the scroll container's own edges to transparent.
 *
 * A mask rather than a gradient overlay, because an overlay has to be painted
 * in the colour behind the table, and a guess is visibly wrong: the first
 * version drew `containerL0` (#09090a) over rows that sit on `grey-1000`
 * (#0e0e0f), which reads as a darker band rather than a fade. Masking reveals
 * whatever is really behind, so it cannot mismatch.
 *
 * The mask covers the whole box, scrollbar included, so a classic scrollbar
 * would fade at its ends too. A solid layer over each scrollbar strip keeps it
 * opaque: mask layers add, so wherever any layer is opaque, it shows.
 */
export const edgeFadeStyle = ({
  canScrollLeft,
  canScrollRight,
  scrollbarHeight = 0,
  scrollbarWidth = 0,
}: Pick<HorizontalScrollHint, 'canScrollLeft' | 'canScrollRight'> &
  Partial<Pick<HorizontalScrollHint, 'scrollbarHeight' | 'scrollbarWidth'>>):
  | CSSProperties
  | undefined => {
  if (!canScrollLeft && !canScrollRight) return undefined;

  const left = canScrollLeft ? 'transparent 0' : '#000 0';
  const right = canScrollRight ? 'transparent 100%' : '#000 100%';
  const gradient = `linear-gradient(to right, ${left}, #000 ${FADE_PX}px, #000 calc(100% - ${FADE_PX}px), ${right})`;

  if (scrollbarHeight <= 0 && scrollbarWidth <= 0) {
    return { maskImage: gradient, WebkitMaskImage: gradient };
  }

  const solid = 'linear-gradient(#000, #000)';
  const layers = [{ image: gradient, size: '100% 100%', position: '0 0' }];
  if (scrollbarHeight > 0) {
    layers.push({
      image: solid,
      size: `100% ${scrollbarHeight}px`,
      position: '0 100%',
    });
  }
  if (scrollbarWidth > 0) {
    layers.push({
      image: solid,
      size: `${scrollbarWidth}px 100%`,
      position: '100% 0',
    });
  }
  const mask = layers.map((l) => l.image).join(', ');
  const size = layers.map((l) => l.size).join(', ');
  const position = layers.map((l) => l.position).join(', ');
  return {
    maskImage: mask,
    WebkitMaskImage: mask,
    maskSize: size,
    WebkitMaskSize: size,
    maskPosition: position,
    WebkitMaskPosition: position,
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  };
};

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
    scrollbarHeight: 0,
    scrollbarWidth: 0,
  });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const scrollable = maxScroll > EDGE_TOLERANCE_PX;
    // offset* includes borders; client{Top,Left} covers one side and the
    // opposite border matches it on these containers.
    const scrollbarHeight = Math.max(
      0,
      el.offsetHeight - el.clientHeight - 2 * el.clientTop,
    );
    const scrollbarWidth = Math.max(
      0,
      el.offsetWidth - el.clientWidth - 2 * el.clientLeft,
    );

    setHint((prev) => {
      const next = {
        scrollable,
        canScrollLeft: scrollable && el.scrollLeft > EDGE_TOLERANCE_PX,
        canScrollRight:
          scrollable && el.scrollLeft < maxScroll - EDGE_TOLERANCE_PX,
        scrollbarHeight,
        scrollbarWidth,
      };

      return prev.scrollable === next.scrollable &&
        prev.canScrollLeft === next.canScrollLeft &&
        prev.canScrollRight === next.canScrollRight &&
        prev.scrollbarHeight === next.scrollbarHeight &&
        prev.scrollbarWidth === next.scrollbarWidth
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
