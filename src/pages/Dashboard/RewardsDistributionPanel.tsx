import Placeholder from '@src/components/Placeholder';

const RewardsDistributionPanel = () => {

    const data = undefined;

  return (
    <div className="min-w-[22rem] rounded-xl border border-grey-500">
      <div className="px-5 pt-5 text-base text-mid">
        Eligible Rewards by Epoch vs. Rewards Claimed
      </div>
      <div className="relative h-[120px] w-[352px]">
        {data ? <div></div> : <Placeholder className="m-4 h-4" />}
      </div>
    </div>
  );
};

export default RewardsDistributionPanel;
