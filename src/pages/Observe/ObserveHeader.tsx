import { AoGateway } from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import Placeholder from '@src/components/Placeholder';
import Profile from '@src/components/Profile';
import {
  BinocularsGradientIcon,
  BinocularsIcon,
  HeaderSeparatorIcon,
} from '@src/components/icons';
import { log } from '@src/constants';
import usePrescribedNames from '@src/hooks/usePrescribedNames';
import db from '@src/store/db';
import { Assessment } from '@src/types';
import { performAssessment } from '@src/utils/observations';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const isSearchStringValid = (searchString: string) => {
  return (
    searchString.length > 0 &&
    searchString.split(',').every((s) => s.trim().length > 0)
  );
};

const ObserveHeader = ({
  gateway,
  setSelectedAssessment,
}: {
  gateway?: AoGateway;
  setSelectedAssessment: React.Dispatch<
    React.SetStateAction<Assessment | undefined>
  >;
}) => {
  const params = useParams();
  const ownerId = params?.ownerId;
  
  const [runningObservation, setRunningObservation] = useState(false);

  // fetch current prescribed names, fallback to defaults
  const { data: prescribedNames = [], isLoading: loadingPrescribedNames } =
    usePrescribedNames();

  const [arnsNamesToSearch, setArnsNamesToSearch] = useState(
    prescribedNames.join(', '),
  );

  const runObservation = async () => {
    setRunningObservation(true);
    const assessment = await performAssessment(
      { ...gateway!, gatewayAddress: ownerId! },
      [],
      arnsNamesToSearch
        .split(',')
        .reduce(
          (acc, s) => (s.trim().length > 0 ? [...acc, s.trim()] : acc),
          [] as string[],
        ),
    );
    log.debug(assessment);

    setSelectedAssessment(assessment);

    await db.observations.add({
      gatewayAddress: ownerId!,
      timestamp: Date.now(),
      assessment,
    });
    setRunningObservation(false);
  };

  // update prescribed names after loading
  useEffect(() => {
    setArnsNamesToSearch(prescribedNames.join(','));
  }, [prescribedNames]);

  return (
    <header className="mt-6 flex-col text-clip rounded-xl border leading-[1.4] dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <div className="flex items-center gap-3 py-5 pl-6 pr-4 text-sm">
        <div className="text-mid">
          <Link to={'/gateways'}>Gateways</Link>
        </div>
        <HeaderSeparatorIcon className="size-4"/>
        {gateway ? (
          <Link className="text-mid" to={`/gateways/${ownerId}`}>
            {gateway.settings.label}
          </Link>
        ) : (
          <Placeholder />
        )}
        <HeaderSeparatorIcon className="size-4"/>
        <Link className="text-mid" to={`/gateways/${ownerId}/reports`}>
          Observe
        </Link>
        <div className="grow" />
        <div className="items-center">
          <Profile />
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-b-xl bg-grey-900 px-6 py-5">
        <BinocularsIcon className="size-4" />
        <div className="text-high">Observe</div>
        <div className="grow" />
        <div className="text-xs text-high">ArNS names:</div>
        <input
          className={
            'h-7 w-[12.5rem] rounded-md border border-grey-700 bg-grey-1000 p-3 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high'
          }
          type="text"
          disabled={!gateway || loadingPrescribedNames}
          readOnly={!gateway || loadingPrescribedNames}
          value={arnsNamesToSearch}
          onChange={(e) => {
            setArnsNamesToSearch(e.target.value);
          }}
        ></input>

        <div
          className={
            gateway &&
            isSearchStringValid(arnsNamesToSearch) &&
            !runningObservation
              ? undefined
              : 'pointer-events-none opacity-30'
          }
        >
          <Button
            title="Run Observation"
            buttonType={ButtonType.PRIMARY}
            text="Run Observation"
            icon={<BinocularsGradientIcon className="size-4" />}
            onClick={() => runObservation()}
          />
        </div>
      </div>
    </header>
  );
};

export default ObserveHeader;
