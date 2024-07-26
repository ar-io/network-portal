import { WarningIcon } from '../icons';

const UnstakeWarning = () => {
  return (
    <div>
      <div className="flex gap-3 rounded bg-containerL3 p-4">
        <WarningIcon width={40} height={20} />
        <div className="grow text-[0.8125rem] text-high">
          30 days is the standard unstaking period. During this withdrawal time
          your tokens will be locked and will not be accruing rewards.
        </div>
      </div>
    </div>
  );
};

export default UnstakeWarning;
