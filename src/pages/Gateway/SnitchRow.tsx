import { AoGatewayWithAddress } from '@ar.io/sdk/web';
import Button from '@src/components/Button';
import Dropdown from '@src/components/Dropdown';
import Placeholder from '@src/components/Placeholder';
import { StatsArrowIcon } from '@src/components/icons';
import useEpochs from '@src/hooks/useEpochs';
import useObserverToGatewayMap from '@src/hooks/useObserverToGatewayMap';
import { CheckCircleIcon, NotebookText, XCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type ReportedOnByEntry = {
  observerId: string;
  reportId?: string;
};

const ReportedOnByCard = ({
  gateway,
}: {
  gateway?: AoGatewayWithAddress | null;
}) => {
  const { data: epochs } = useEpochs();
  const [selectedEpochIndex, setSelectedEpochIndex] = useState(0);
  const [failureObservers, setFailureObservers] = useState<ReportedOnByEntry[]>(
    [],
  );
  const [totalReportsForEpoch, setTotalReportsForEpoch] = useState<number>(0);
  const observerToGatewayMap = useObserverToGatewayMap();
  const navigate = useNavigate();

  useEffect(() => {
    if (epochs) {
      const selectedEpoch = epochs[selectedEpochIndex];
      setTotalReportsForEpoch(
        selectedEpoch?.observations?.reports
          ? Object.keys(selectedEpoch?.observations?.reports).length
          : 0,
      );

      if (gateway) {
        const observers =
          selectedEpoch?.observations.failureSummaries[
            gateway.gatewayAddress
          ] || [];
        const entries = observers.map<ReportedOnByEntry>((observerId) => {
          return {
            observerId,
            reportId: selectedEpoch?.observations.reports[observerId],
          };
        });
        setFailureObservers(entries);
      } else {
        setFailureObservers([]);
      }
    } else {
      setFailureObservers([]);
    }
  }, [epochs, gateway, selectedEpochIndex]);

  return (
    <div className="w-full rounded-xl border border-transparent-100-16 text-sm">
      <div className="flex flex-col border-b border-grey-500 bg-containerL3 lg:flex-row">
        {epochs ? (
          <>
            <div className="flex">
              <div className="grow whitespace-nowrap px-6 py-4">
                {failureObservers.length === 0 ? (
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
                {failureObservers.length <= totalReportsForEpoch / 2 ? (
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
  gateway?: AoGatewayWithAddress | null;
}) => {
  const { data: epochs } = useEpochs();
  const [selectedEpochIndex, setSelectedEpochIndex] = useState(0);
  const [snitchedOn, setSnitchedOn] = useState<string[]>([]);
  const [reportId, setReportId] = useState<string>();
  const [selectedForObservation, setSelectedForObservation] =
    useState<boolean>();

  const navigate = useNavigate();

  useEffect(() => {
    if (epochs) {
      const selectedEpoch = epochs[selectedEpochIndex];

      if (gateway && selectedEpoch) {
        const address = gateway.observerAddress;

        setReportId(selectedEpoch.observations.reports[address]);

        setSelectedForObservation(
          selectedEpoch.prescribedObservers?.find(
            (obs) => obs.observerAddress === address,
          ) !== undefined,
        );

        const snitchedOn = Object.entries(
          selectedEpoch.observations.failureSummaries,
        ).reduce((acc, [gatewayAddress, reportedBy]) => {
          if (reportedBy.includes(address)) {
            acc.push(gatewayAddress);
          }
          return acc;
        }, [] as string[]);
        setSnitchedOn(snitchedOn);
      } else {
        setSelectedForObservation(undefined);
        setSnitchedOn([]);
      }
    } else {
      setSelectedForObservation(undefined);
      setSnitchedOn([]);
    }
  }, [epochs, gateway, selectedEpochIndex]);

  return (
    <div className="w-full rounded-xl border border-transparent-100-16 text-sm">
      <div className="flex flex-col border-b border-grey-500 bg-containerL3 lg:flex-row">
        {epochs ? (
          <>
            <div className="flex items-center">
              <div className="grow items-center whitespace-nowrap py-4 pl-6">
                {selectedForObservation ? (
                  <>
                    <div className="text-mid">
                      Reported on{' '}
                      <span className="text-red-500">{snitchedOn.length}</span>{' '}
                      gateways
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

const SnitchRow = ({ gateway }: { gateway?: AoGatewayWithAddress | null }) => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ReportedOnByCard gateway={gateway} />
      <ReportedOnCard gateway={gateway} />
    </div>
  );
};

export default SnitchRow;
