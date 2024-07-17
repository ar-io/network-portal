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
import observationDB from '@src/store/observationsDB';
import { performAssessment } from '@src/utils/observations';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const isSearchStringValid = (searchString: string) => {
  return (
    searchString.length > 0 &&
    searchString.split(',').every((s) => s.trim().length > 0)
  );
};

const ObserveHeader = ({ gateway }: { gateway?: AoGateway }) => {
  const params = useParams();
  const ownerId = params?.ownerId;

  const [arnsNamesToSearch, setArnsNamesToSearch] =
    useState('dapp_ardrive, arns');
  const [runningObservation, setRunningObservation] = useState(false);

  const runObservation = async () => {
      setRunningObservation(true);
      const assessment = await performAssessment(
        { ...gateway!, gatewayAddress: ownerId! },
        [],
        arnsNamesToSearch
          .split(',')
          .reduce(
            (acc, s) =>
              s.trim().length > 0 ? [...acc, s.trim()] : acc,
            [] as string[],
          ),
      );
      log.debug(assessment); 

      await observationDB.observations.add({ 
        gatewayAddress: ownerId!,
        timestamp: Date.now(),
        assessment,
      });
      setRunningObservation(false);
  };

  return (
    <header className="mt-[24px] flex-col text-clip rounded-xl border leading-[1.4] dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <div className="flex items-center gap-[12px] py-[20px] pl-[24px] pr-[16px] text-sm">
        <div className="text-mid">
          <Link to={'/gateways'}>Gateways</Link>
        </div>
        <HeaderSeparatorIcon />
        {gateway ? (
          <Link className="text-mid" to={`/gateways/${ownerId}`}>
            {gateway.settings.label}
          </Link>
        ) : (
          <Placeholder />
        )}
        <HeaderSeparatorIcon />
        <Link className="text-mid" to={`/gateways/${ownerId}/reports`}>
          Observe
        </Link>
        <div className="grow" />
        <div className="items-center">
          <Profile />
        </div>
      </div>
      <div className="flex items-center gap-[12px] rounded-b-xl bg-grey-900 px-[24px] py-[20px]">
        <BinocularsIcon />
        <div className="text-high">Observe</div>
        <div className="grow" />
        <div className="text-xs text-high">ArNS names:</div>
        <input
          className={
            'h-7 w-[200px] rounded-md border border-grey-700 bg-grey-1000 p-[12px] text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high'
          }
          type="text"
          disabled={!gateway}
          readOnly={!gateway}
          value={arnsNamesToSearch}
          onChange={(e) => {
            setArnsNamesToSearch(e.target.value);
          }}
        ></input>

        <div
          className={
            gateway && isSearchStringValid(arnsNamesToSearch) && !runningObservation
              ? undefined
              : 'pointer-events-none opacity-30'
          }
        >
          <Button
            title="Run Observation"
            buttonType={ButtonType.PRIMARY}
            text="Run Observation"
            icon={<BinocularsGradientIcon />}
            onClick={() => runObservation()}
          />
        </div>
      </div>
    </header>
  );
};

export default ObserveHeader;
