import Button from '@src/components/Button';
import { BinocularsIcon } from '@src/components/icons';
import Placeholder from '@src/components/Placeholder';
import useEpochSettings from '@src/hooks/useEpochSettings';
import { useGlobalState } from '@src/store';
import { useNavigate } from 'react-router-dom';

const ObserverPerformancePanel = () => {
  const navigate = useNavigate();
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const { data: epochSettings } = useEpochSettings();

  const reportsCount = currentEpoch
    ? Object.keys(currentEpoch.observations.reports).length
    : undefined;

  return (
    <div className="flex flex-col rounded-xl border border-grey-500 px-6 py-5 lg:min-w-[22rem]">
      <div className="flex w-full items-center">
        <div className="grow text-sm text-mid">Observer Performance</div>
        <Button
          className="max-h-6 text-xs"
          icon={<BinocularsIcon className="size-3" />}
          title={'Observers'}
          text={'Observers'}
          active={true}
          onClick={() => {
            navigate('/observers');
          }}
        />
      </div>
      {epochSettings && !epochSettings.hasEpochZeroStarted ? (
        <div className="flex grow items-center justify-center self-center text-center text-sm italic text-low">
          Awaiting first epoch...
        </div>
      ) : (
        <>
          <div className="flex grow justify-between align-bottom text-[2.625rem] font-bold text-high">
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
              {reportsCount !== undefined ? (
                <>
                  <div>{reportsCount}/50</div>
                  <div>observations submitted</div>
                </>
              ) : (
                <Placeholder />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ObserverPerformancePanel;
