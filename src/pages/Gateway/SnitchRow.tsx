import { AoGatewayWithAddress } from '@ar.io/sdk/web';
import Dropdown from '@src/components/Dropdown';
import { StatsArrowIcon } from '@src/components/icons';
import Placeholder from '@src/components/Placeholder';
import useEpochs from '@src/hooks/useEpochs';
import useObserverToGatewayMap from '@src/hooks/useObserverToGatewayMap';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ReportedOnByCard = ({ gateway }: { gateway?: AoGatewayWithAddress }) => {
  const { data: epochs } = useEpochs();
  const [selectedEpochIndex, setSelectedEpochIndex] = useState(0);
  const [failureObservers, setFailureObservers] = useState<string[]>([]);
  const observerToGatewayMap = useObserverToGatewayMap();

  useEffect(() => {
    if (epochs) {
      const selectedEpoch = epochs[selectedEpochIndex];

      if (gateway) {
        const observers =
          selectedEpoch?.observations.failureSummaries[
            gateway.gatewayAddress
          ] || [];
        setFailureObservers(observers);
      } else {
        setFailureObservers([]);
      }
    } else {
      setFailureObservers([]);
    }
  }, [epochs, gateway, selectedEpochIndex]);

  return (
    <div className="w-full rounded-xl border border-transparent-100-16 text-sm">
      <div className="flex border-b border-grey-500 bg-containerL3">
        {epochs ? (
          <>
            <div className="grow whitespace-nowrap px-6 py-4">
              {failureObservers.length == 0 ? (
                <div className="text-mid">No Failures Reported</div>
              ) : (
                <div className="text-mid">
                  Failed by{' '}
                  <span className="text-red-500">
                    {failureObservers.length}/50
                  </span>{' '}
                  observers
                </div>
              )}
            </div>
            <Dropdown
              options={
                epochs?.map((epoch, index) => ({
                  label:
                    index == 0 ? 'Current Epoch' : `Epoch ${epoch?.epochIndex}`,
                  value: index.toString(),
                })) || []
              }
              onChange={(e) => {
                setSelectedEpochIndex(Number(e.target.value));
              }}
              value={selectedEpochIndex.toString()}
            />
          </>
        ) : (
          <Placeholder className="m-4 h-4" />
        )}
      </div>
      <div className="h-80 overflow-hidden overflow-y-auto scrollbar">
        {failureObservers?.map((observer) => (
          <div
            key={observer}
            className="flex gap-1 border-t border-grey-500 px-6 py-4 text-xs text-low"
          >
            <StatsArrowIcon className="size-4" />
            <div>
              {observerToGatewayMap ? (
                <Link to={`/gateways/${observerToGatewayMap[observer]}`}>
                  {observer}
                </Link>
              ) : (
                observer
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportedOnCard = ({ gateway }: { gateway?: AoGatewayWithAddress }) => {
  const { data: epochs } = useEpochs();
  const [selectedEpochIndex, setSelectedEpochIndex] = useState(0);
  const [snitchedOn, setSnitchedOn] = useState<string[]>([]);
  const [selectedForObservation, setSelectedForObservation] =
    useState<boolean>();

  useEffect(() => {
    if (epochs) {
      const selectedEpoch = epochs[selectedEpochIndex];

      if (gateway && selectedEpoch) {
        const address = gateway.observerAddress;

        setSelectedForObservation(
          selectedEpoch.prescribedObservers?.find(
            (obs) => obs.observerAddress == address,
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
      <div className="flex border-b border-grey-500 bg-containerL3 ">
        {epochs ? (
          <>
            <div className="grow whitespace-nowrap px-6 py-4">
              {selectedForObservation ? (
                <div className="text-mid">
                  Reported on{' '}
                  <span className="text-red-500">{snitchedOn.length}</span>{' '}
                  gateways
                </div>
              ) : (
                <div className="text-low">Not Selected for Observation</div>
              )}
            </div>
            <Dropdown
              options={
                epochs?.map((epoch, index) => ({
                  label:
                    index == 0 ? 'Current Epoch' : `Epoch ${epoch?.epochIndex}`,
                  value: index.toString(),
                })) || []
              }
              onChange={(e) => setSelectedEpochIndex(Number(e.target.value))}
              value={selectedEpochIndex.toString()}
            />
          </>
        ) : (
          <Placeholder className="m-4 h-4" />
        )}
      </div>

      <div className="h-80 overflow-hidden overflow-y-auto scrollbar">
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

const SnitchRow = ({ gateway }: { gateway?: AoGatewayWithAddress }) => {
  return (
    <div className="grid min-w-[50rem] grid-cols-2 gap-6">
      <ReportedOnByCard gateway={gateway} />
      <ReportedOnCard gateway={gateway} />
    </div>
  );
};

export default SnitchRow;
