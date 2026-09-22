import { edgeFadeStyle } from '@src/hooks/useHorizontalScrollHint';

describe('edgeFadeStyle', () => {
  it('applies no mask when there is nothing to scroll to', () => {
    expect(
      edgeFadeStyle({ canScrollLeft: false, canScrollRight: false }),
    ).toBeUndefined();
  });

  it('uses a single fade layer with overlay scrollbars', () => {
    const style = edgeFadeStyle({ canScrollLeft: false, canScrollRight: true });

    expect(style?.maskImage).toMatch(/^linear-gradient\(to right/);
    expect(style?.maskSize).toBeUndefined();
  });

  /** The mask covers the scrollbar too; without this its ends fade out. */
  it('keeps a classic horizontal scrollbar opaque', () => {
    const style = edgeFadeStyle({
      canScrollLeft: true,
      canScrollRight: true,
      scrollbarHeight: 8,
    });

    expect(style?.maskImage).toContain('linear-gradient(#000, #000)');
    expect(style?.maskSize).toEqual('100% 100%, 100% 8px');
    expect(style?.maskPosition).toEqual('0 0, 0 100%');
    expect(style?.maskRepeat).toEqual('no-repeat');
  });

  it('keeps a vertical scrollbar opaque under the right-edge fade', () => {
    const style = edgeFadeStyle({
      canScrollLeft: false,
      canScrollRight: true,
      scrollbarHeight: 8,
      scrollbarWidth: 6,
    });

    expect(style?.maskSize).toEqual('100% 100%, 100% 8px, 6px 100%');
    expect(style?.maskPosition).toEqual('0 0, 0 100%, 100% 0');
  });
});
