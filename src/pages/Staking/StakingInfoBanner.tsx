import { InfoIcon, LinkArrowIcon } from '@src/components/icons';

const StakingInfoBanner = () => {
  return (
    <div className="relative flex items-center justify-between rounded-xl bg-gradient-to-r from-grey-800 to-grey-700 p-4 overflow-hidden">
      <div className="flex items-center gap-3">
        <InfoIcon className="size-5 text-primary shrink-0" />
        <div className="text-sm">
          <span className="text-high font-medium">
            Learn about delegated staking
          </span>
          <span className="text-mid ml-2">
            Understand how staking works, rewards distribution, and withdrawal
            periods.
          </span>
        </div>
      </div>
      <a
        href="https://docs.ar.io/learn/token/staking/#how-delegated-staking-works"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-sm font-medium text-primary hover:text-high transition-colors shrink-0"
      >
        View Docs
        <LinkArrowIcon className="size-3" />
      </a>
    </div>
  );
};

export default StakingInfoBanner;
