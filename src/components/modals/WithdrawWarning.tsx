import { WarningTriangleIcon } from '../icons';

const WithdrawWarning = () => {
  return (
    <div>
      <div className="flex gap-3 rounded bg-containerL3 p-4">
        <WarningTriangleIcon width={40} height={20} />
        <div className="grow text-[0.8125rem] text-high">
          30 days is the standard withdrawal period. During this time
          your tokens will be locked and will not be accruing rewards.
        </div>
      </div>
    </div>
  );
};

export default WithdrawWarning;
