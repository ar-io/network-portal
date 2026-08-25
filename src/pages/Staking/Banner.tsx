import ProtocolParameterGrid from '@src/components/ProtocolParameterGrid';
import {
  LinkArrowIcon,
  ObserversConnectIcon,
  StakingLinesBGIcon,
} from '@src/components/icons';
import ConnectModal from '@src/components/modals/ConnectModal';
import { useProtocolParameters } from '@src/hooks/useProtocolParameters';
import { useState } from 'react';

const DELEGATED_STAKING_DOCS =
  'https://docs.ar.io/learn/oip/staking#delegated-staking';

/**
 * The pre-connect card on the Staking page.
 *
 * Three separate elements used to say overlapping things here: this card, a
 * "Learn about delegated staking" strip whose whole payload was a docs link,
 * and a card of protocol limits. A prospective delegator had to read all three
 * to answer one question — what am I committing to. They are one card now.
 *
 * It was previously a single full-card `<button>`, which could not hold any of
 * this: a tooltip trigger nested inside a button is invalid, and clicking an
 * info icon would have opened the wallet modal rather than explaining the
 * number. Hence one explicit button instead.
 */
const Banner = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const { parameters } = useProtocolParameters('delegate');

  return (
    <div>
      <div className="relative w-full overflow-hidden rounded-xl bg-grey-800">
        <StakingLinesBGIcon className="pointer-events-none absolute top-[-5.625rem] h-[58.1875rem] w-[90rem] opacity-80" />

        <div className="relative z-10 flex flex-col items-center px-6 py-8">
          <div className="flex items-center gap-2">
            <ObserversConnectIcon className="size-4" />
            <div className="text-gradient">
              Connect your wallet to start staking
            </div>
          </div>

          <div className="pt-2 text-center text-sm text-low">
            By delegating stake to a gateway, you can participate in the
            network&apos;s reward system.
          </div>

          <button
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end px-5 py-2 text-sm font-medium text-grey-900 transition-opacity hover:opacity-90"
            onClick={() => setLoginOpen(true)}
          >
            Connect Wallet
          </button>

          <div className="mt-7 w-full border-t border-transparent-100-8 pt-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-high">Before you stake</span>
                <span className="text-xs text-low">
                  set by the protocol, not by us
                </span>
              </div>
              <a
                href={DELEGATED_STAKING_DOCS}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1 text-xs text-mid transition-colors hover:text-high"
              >
                How delegated staking works
                <LinkArrowIcon className="size-3" />
              </a>
            </div>
            <ProtocolParameterGrid parameters={parameters} />
          </div>
        </div>
      </div>
      {loginOpen && <ConnectModal onClose={() => setLoginOpen(false)} />}
    </div>
  );
};

export default Banner;
