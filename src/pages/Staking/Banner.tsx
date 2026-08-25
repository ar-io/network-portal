import ProtocolParameterGrid from '@src/components/ProtocolParameterGrid';
import { LinkArrowIcon, PinkArrowIcon } from '@src/components/icons';
import ConnectModal from '@src/components/modals/ConnectModal';
import { useProtocolParameters } from '@src/hooks/useProtocolParameters';
import { useGlobalState } from '@src/store';
import { useState } from 'react';

const DELEGATED_STAKING_DOCS =
  'https://docs.ar.io/learn/oip/staking#delegated-staking';

/**
 * The pre-connect card on the Staking page.
 *
 * Deliberately the same shape as the gateway join card: what you do on the
 * left, what the protocol requires on the right. The two are the network's two
 * ways in, and presenting them differently made them look like unrelated
 * features rather than a choice between running a gateway and backing one.
 *
 * Three separate elements used to say overlapping things here — this card, a
 * "Learn about delegated staking" strip whose whole payload was a docs link,
 * and a card of protocol limits. They are one card now.
 *
 * It was also a single full-card `<button>`, which could not hold any of this:
 * a tooltip trigger nested inside a button is invalid, and clicking an info
 * icon would have opened the wallet modal rather than explaining the number.
 */
const Banner = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const { parameters } = useProtocolParameters('delegate');
  const ticker = useGlobalState((state) => state.ticker);

  return (
    <div>
      <div className="relative h-auto w-full overflow-hidden rounded-xl bg-grey-800 p-6">
        <div className="relative z-10">
          <div className="mb-1 flex items-center gap-2">
            <div className="text-gradient text-lg font-medium">
              Back the Permanent Cloud and Start Earning Rewards
            </div>
            <PinkArrowIcon className="size-3 shrink-0" />
          </div>

          <div className="mb-5 max-w-2xl text-xs text-mid">
            Delegate {ticker} to a gateway you trust and share the rewards it
            earns — without running one yourself.
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
            <div className="flex shrink-0 flex-col justify-between gap-6 lg:w-[24rem]">
              <ol className="flex flex-col gap-2 text-sm text-low">
                <li>1. Pick a gateway from the list below</li>
                <li>2. Delegate {ticker} to it</li>
                <li>3. Earn a share of its rewards each epoch</li>
              </ol>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={DELEGATED_STAKING_DOCS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-grey-600 bg-grey-700 px-4 py-2 text-sm text-high transition-colors hover:bg-grey-600"
                >
                  How Staking Works
                  <LinkArrowIcon className="h-3 w-3" />
                </a>

                <button
                  onClick={() => setLoginOpen(true)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end px-4 py-2 text-sm font-medium text-grey-900 transition-opacity hover:opacity-90"
                >
                  Connect Wallet to Stake
                  <PinkArrowIcon
                    className="size-3 text-grey-900"
                    style={{ filter: 'brightness(0)' }}
                  />
                </button>
              </div>
            </div>

            <div className="min-w-0 grow border-t border-transparent-100-8 pt-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm text-high">Before you stake</span>
                <span className="text-xs text-low">
                  set by the protocol, not by us
                </span>
              </div>
              <ProtocolParameterGrid
                parameters={parameters}
                columns="grid-cols-2 sm:grid-cols-3"
              />
            </div>
          </div>
        </div>
      </div>
      {loginOpen && <ConnectModal onClose={() => setLoginOpen(false)} />}
    </div>
  );
};

export default Banner;
