import { GatewayWithAddress } from '@ar.io/sdk/web';
import Button from '@src/components/Button';
import Dropdown from '@src/components/Dropdown';
import Placeholder from '@src/components/Placeholder';
import { StatsArrowIcon } from '@src/components/icons';
import useEpochs from '@src/hooks/useEpochs';
import useObservations from '@src/hooks/useObservations';
import useObserverToGatewayMap from '@src/hooks/useObserverToGatewayMap';
import {
  CheckCircleIcon,
  CircleHelpIcon,
  NotebookText,
  XCircleIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type ReportedOnByEntry = {
  observerId: string;
  reportId?: string;
};

const ReportedOnByCard = ({
  gateway,
}: {
  gateway?: GatewayWithAddress | null;
}) => {
  const { data: epochs } = useEpochs();
  const [selectedEpochIndex, setSelectedEpochIndex] = useState(0);
  const [failureObservers, setFailureObservers] = useState<ReportedOnByEntry[]>(
    [],
  );
  const [totalReportsForEpoch, setTotalReportsForEpoch] = useState<number>(0);
  /**
   * Whether this epoch's results can be attributed to individual gateways.
   *
   * False for past epochs served from the archive. Without this the empty
   * `failureSummaries` reads as "no failures", and the card renders a green
   * "Passed" for a gateway whose result is simply unknown — a verdict invented
   * from missing data.
   */
  const [hasAttribution, setHasAttribution] = useState<boolean>(true);
  const observerToGatewayMap = useObserverToGatewayMap();
  const navigate = useNavigate();

  const selectedEpoch = epochs?.[selectedEpochIndex];
  const { data: observations } = useObservations(selectedEpoch);

  useEffect(() => {
    if (observations) {
      setTotalReportsForEpoch(Object.keys(observations.reports).length);
      setHasAttribution(observations.hasGatewayAttribution);

      if (gateway) {
        const observers =
          observations.failureSummaries[gateway.gatewayAddress] || [];
        const entries = observers.map<ReportedOnByEntry>((observerId) => {
          return {
            observerId,
            reportId: observations.reports[observerId],
          };
        });
        setFailureObservers(entries);
      } else {
        setFailureObservers([]);
      }
    } else {
      setFailureObservers([]);
    }
  }, [observations, gateway]);

  return (
    <div className="w-full rounded-xl border border-transparent-100-16 text-sm">
      <div className="flex flex-col border-b border-grey-500 bg-containerL3 lg:flex-row">
        {epochs ? (
          <>
            <div className="flex">
              <div className="grow whitespace-nowrap px-6 py-4">
                {!observations ? (
                  // Until the results land there is nothing to state. The
                  // empty default would otherwise read as "no failures", and
                  // the badge beside it as a green pass — a verdict rendered
                  // before any data exists. Switching epochs now costs a
                  // round trip, so this is on screen long enough to be read.
                  <Placeholder className="h-4 w-40" />
                ) : !hasAttribution ? (
                  // Short, like every other state in this header. The reason
                  // the list below is empty belongs in the empty list, not
                  // crammed onto a nowrap row beside the epoch selector.
                  <div className="text-mid">
                    {totalReportsForEpoch} report
                    {totalReportsForEpoch === 1 ? '' : 's'} submitted
                  </div>
                ) : failureObservers.length === 0 ? (
                  <div className="text-mid">No Failures Reported</div>
                ) : (
                  <div className="text-mid">
                    Failed by{' '}
                    <span className="text-red-500">
                      {failureObservers.length}/{totalReportsForEpoch}
                    </span>{' '}
                    observers
                  </div>
                )}
              </div>
              <div className="mr-4 flex items-center">
                {!observations ? (
                  <Placeholder className="h-4 w-16" />
                ) : !hasAttribution ? (
                  // Carries an icon like the pass and fail states so it reads
                  // as a verdict of its own rather than as a stray word.
                  <div className="flex items-center text-low">
                    <CircleHelpIcon className="mr-1 size-4" />
                    <span>Unknown</span>
                  </div>
                ) : failureObservers.length <= totalReportsForEpoch / 2 ? (
                  <div className="flex items-center text-green-500">
                    <CheckCircleIcon className="mr-1 size-4" />
                    <span>
                      {selectedEpochIndex === 0 ? 'Passing' : 'Passed'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-500">
                    <XCircleIcon className="mr-1 size-4" />
                    <span>
                      {selectedEpochIndex === 0 ? 'Failing' : 'Failed'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="grow place-items-end">
              <Dropdown
                options={
                  epochs?.map((epoch, index) => ({
                    label:
                      index === 0
                        ? 'Current Epoch'
                        : `Epoch ${epoch?.epochIndex}`,
                    value: index.toString(),
                  })) || []
                }
                onChange={(e) => {
                  setSelectedEpochIndex(Number(e.target.value));
                }}
                value={selectedEpochIndex.toString()}
              />
            </div>
          </>
        ) : (
          <Placeholder className="m-4 h-4" />
        )}
      </div>
      <div className="h-80 overflow-hidden overflow-y-auto scrollbar scrollbar-thin">
        {observations && !hasAttribution ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-10 text-center">
            <CircleHelpIcon className="size-5 text-low" />
            <div className="text-xs text-low">
              This epoch is served from the published archive, which records how
              many gateways each observer passed but not which ones. Naming them
              would mean reading the results against today&apos;s registry
              order, which has since changed.
            </div>
          </div>
        ) : observations && failureObservers.length === 0 ? (
          <div className="flex h-full items-center justify-center px-10 text-center text-xs text-low">
            No observer reported this gateway as failing in this epoch.
          </div>
        ) : null}
        {failureObservers?.map((entry) => (
          <div
            key={entry.observerId}
            className="flex items-center gap-1 border-t border-grey-500 py-2.5 pl-6 pr-2 text-xs text-low"
          >
            <StatsArrowIcon className="size-4" />
            <div className="flex w-full items-center">
              {observerToGatewayMap && epochs ? (
                <>
                  <Link
                    className="grow"
                    to={`/gateways/${observerToGatewayMap[entry.observerId]}`}
                  >
                    {entry.observerId}
                  </Link>

                  {entry.reportId && (
                    <Button
                      className="h-fit last:p-2"
                      active={true}
                      text={
                        <NotebookText
                          className="size-3 text-mid"
                          strokeWidth={1.5}
                        />
                      }
                      onClick={() => {
                        if (entry.reportId) {
                          navigate(
                            `/gateways/${observerToGatewayMap[entry.observerId]}/reports/${entry.reportId}`,
                          );
                        }
                      }}
                      title={'View Report'}
                    ></Button>
                  )}
                </>
              ) : (
                <Placeholder className="h-4" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportedOnCard = ({
  gateway,
}: {
  gateway?: GatewayWithAddress | null;
}) => {
  const { data: epochs } = useEpochs();
  const [selectedEpochIndex, setSelectedEpochIndex] = useState(0);
  const [snitchedOn, setSnitchedOn] = useState<string[]>([]);
  /**
   * How many gateways this observer failed.
   *
   * Taken from the observer's own results bitmap where possible, which is a
   * population count and so survives into past epochs — unlike `snitchedOn`,
   * which needs each result mapped back to a specific gateway.
   */
  const [reportedOnCount, setReportedOnCount] = useState<number>();
  const [hasAttribution, setHasAttribution] = useState<boolean>(true);
  const [reportId, setReportId] = useState<string>();
  const [selectedForObservation, setSelectedForObservation] =
    useState<boolean>();

  const navigate = useNavigate();

  const selectedEpoch = epochs?.[selectedEpochIndex];
  const { data: observations } = useObservations(selectedEpoch);

  useEffect(() => {
    if (selectedEpoch && observations) {
      if (gateway) {
        const address = gateway.observerAddress;

        setReportId(observations.reports[address]);

        setSelectedForObservation(
          selectedEpoch.prescribedObservers?.find(
            (obs) => obs.observerAddress === address,
          ) !== undefined,
        );

        const snitchedOn = Object.entries(observations.failureSummaries).reduce(
          (acc, [gatewayAddress, reportedBy]) => {
            if (reportedBy.includes(address)) {
              acc.push(gatewayAddress);
            }
            return acc;
          },
          [] as string[],
        );
        setSnitchedOn(snitchedOn);
        setHasAttribution(observations.hasGatewayAttribution);
        setReportedOnCount(
          observations.totalsByObserver[address]?.failed ??
            (observations.hasGatewayAttribution
              ? snitchedOn.length
              : undefined),
        );
      } else {
        setSelectedForObservation(undefined);
        setSnitchedOn([]);
        setReportedOnCount(undefined);
      }
    } else {
      setSelectedForObservation(undefined);
      setSnitchedOn([]);
      setReportedOnCount(undefined);
    }
  }, [selectedEpoch, observations, gateway]);

  return (
    <div className="w-full rounded-xl border border-transparent-100-16 text-sm">
      <div className="flex flex-col border-b border-grey-500 bg-containerL3 lg:flex-row">
        {epochs ? (
          <>
            <div className="flex items-center">
              <div className="grow items-center whitespace-nowrap py-4 pl-6">
                {!observations ? (
                  // Same reason: this reads as a statement about the epoch,
                  // and it must not be made before the epoch has been read.
                  <Placeholder className="h-4 w-48" />
                ) : selectedForObservation ? (
                  <>
                    <div className="text-mid">
                      Reported on{' '}
                      <span className="text-red-500">
                        {reportedOnCount ?? '—'}
                      </span>{' '}
                      gateways
                      {!hasAttribution && reportedOnCount !== undefined && (
                        <span
                          className="pl-1 text-low"
                          title="Counted from this observer's own results, which the archive preserves. Which specific gateways they were is not recoverable for a past epoch."
                        >
                          (not itemised)
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-low">Not Selected for Observation</div>
                )}
              </div>
              {reportId && (
                <Button
                  className="ml-3 mr-2 h-fit last:p-2"
                  active={true}
                  text={
                    <NotebookText
                      className="size-3 text-mid"
                      strokeWidth={1.5}
                    />
                  }
                  onClick={() => {
                    if (reportId) {
                      navigate(
                        `/gateways/${gateway?.gatewayAddress}/reports/${reportId}`,
                      );
                    }
                  }}
                  title={'View Report'}
                ></Button>
              )}
            </div>
            <div className="grow place-items-end">
              <Dropdown
                options={
                  epochs?.map((epoch, index) => ({
                    label:
                      index === 0
                        ? 'Current Epoch'
                        : `Epoch ${epoch?.epochIndex}`,
                    value: index.toString(),
                  })) || []
                }
                onChange={(e) => setSelectedEpochIndex(Number(e.target.value))}
                value={selectedEpochIndex.toString()}
              />
            </div>
          </>
        ) : (
          <Placeholder className="m-4 h-4" />
        )}
      </div>

      <div className="h-80 overflow-hidden overflow-y-auto scrollbar scrollbar-thin">
        {snitchedOn?.map((observer) => (
          <div
            key={observer}
            className="flex gap-1 border-t border-grey-500 px-6 py-4 text-xs text-low"
          >
            <StatsArrowIcon className="size-4" />
            <div>
              <Link to={`/gateways/${observer}`}>{observer}</Link>{' '}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SnitchRow = ({ gateway }: { gateway?: GatewayWithAddress | null }) => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ReportedOnByCard gateway={gateway} />
      <ReportedOnCard gateway={gateway} />
    </div>
  );
};

export default SnitchRow;
