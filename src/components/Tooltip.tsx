import * as ReactTooltip from '@radix-ui/react-tooltip';
import { ReactNode, useState } from 'react';

/**
 * An info bubble that also opens on touch.
 *
 * Radix's tooltip is pointer-and-keyboard only by design: its trigger opens on
 * `pointerenter` and **closes** on `pointerdown`, so on a phone the tap that
 * should open it is the gesture that dismisses it — every info bubble in the
 * app did nothing. Radix's own guidance is to reach for a popover on touch,
 * but these are one-sentence explanations attached to a small icon, and having
 * two components for one affordance is worse than teaching this one to tap.
 *
 * So the open state is controlled: hover and focus still drive it through
 * `onOpenChange`, a tap toggles it, and a tap anywhere else dismisses it.
 * `preventDefault` on a non-mouse `pointerdown` is what stops Radix's own
 * close handler from running — it composes handlers with
 * `checkForDefaultPrevented`, so preventing the default skips it.
 */
const Tooltip = ({
  message,
  children,
  useMaxWidth = true,
  side = 'top',
}: {
  message: ReactNode;
  children: ReactNode;
  useMaxWidth?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
}) => {
  const [open, setOpen] = useState(false);

  return (
    <ReactTooltip.Provider>
      <ReactTooltip.Root delayDuration={0} open={open} onOpenChange={setOpen}>
        <ReactTooltip.Trigger
          asChild={true}
          onPointerDown={(event) => {
            if (event.pointerType !== 'mouse') event.preventDefault();
          }}
          onClick={() => setOpen((wasOpen) => !wasOpen)}
        >
          <div>{children}</div>
        </ReactTooltip.Trigger>
        <ReactTooltip.Portal>
          <ReactTooltip.Content
            side={side}
            // Keep it inside the viewport: the old fixed 25rem was wider than
            // a 375px phone, so a long explanation ran off the screen.
            collisionPadding={16}
            onPointerDownOutside={() => setOpen(false)}
            className={`z-50 mb-1 w-fit ${
              useMaxWidth
                ? 'max-w-[min(25rem,var(--radix-tooltip-content-available-width,25rem))]'
                : ''
            } rounded-md border border-grey-500 bg-containerL0 px-6 py-3`}
          >
            <div className="text-sm text-low">{message}</div>
            {/*
              Radix's own arrow, rather than one pinned at a fixed offset: the
              hand-placed one sat at 48.8% from the left and stayed there when
              the bubble shifted to avoid an edge, which is most of the time on
              a phone, and pointed at nothing.
            */}
            <ReactTooltip.Arrow className="fill-grey-500" />
          </ReactTooltip.Content>
        </ReactTooltip.Portal>
      </ReactTooltip.Root>
    </ReactTooltip.Provider>
  );
};

export default Tooltip;
