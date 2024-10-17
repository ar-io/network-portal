import Placeholder from '@src/components/Placeholder';
import { useGlobalState } from '@src/store';

const ObserverPerformancePanel = () => {
  const currentEpoch = useGlobalState((state) => state.currentEpoch);

  const reportsCount = currentEpoch
    ? Object.keys(currentEpoch.observations.reports).length
    : undefined;

  return (
    <div className="min-w-[22rem] rounded-xl border border-grey-500 px-6 py-5">
      <div className=" text-sm text-mid">Observer Performance</div>
      <div className="grow"></div>
      <div className="flex h-full justify-between pb-5 align-bottom text-[2.625rem] font-bold text-high">
        <div className="flex flex-col place-items-end">
          <div className="grow" />
          <div className="flex items-center leading-none">
            {reportsCount !== undefined ? (
              ((100 * reportsCount) / 50).toFixed(2) + '%'
            ) : (
              <Placeholder />
            )}
          </div>
        </div>
        <div className="flex flex-col place-items-end text-right text-xs">
          <div className="grow" />
          {reportsCount !== undefined? (
            <>
              <div>{reportsCount}/50</div>
              <div>observations submitted</div>
            </>
          ) : (
            <Placeholder />
          )}
        </div>
      </div>
    </div>
  );
};

export default ObserverPerformancePanel;
