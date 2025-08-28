import { AoGateway } from '@ar.io/sdk/web';
import Placeholder from '@src/components/Placeholder';
import Profile from '@src/components/Profile';
import { BinocularsIcon, GatewayIcon } from '@src/components/icons';
import { useGlobalState } from '@src/store';
import { ChevronRightIcon, NotebookText } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

const GatewayHeader = ({ gateway }: { gateway?: AoGateway | null }) => {
  const params = useParams();

  const ownerId = params?.ownerId;

  const currentEpoch = useGlobalState((state) => state.currentEpoch);

  const isObserverThisEpoch = useMemo(() => {
    if (!gateway) return false;

    return currentEpoch?.prescribedObservers.find(
      (observer) => observer.observerAddress === gateway.observerAddress,
    );
  }, [gateway, currentEpoch]);

  return (
    <header className="flex-col text-clip rounded-xl leading-[1.4] lg:mt-6 lg:border dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <div className="flex items-center gap-3 py-5 pl-8 text-sm lg:pl-6 lg:pr-4">
        <div className="text-mid">
          <Link to={'/gateways'}>Gateways</Link>
        </div>
        <ChevronRightIcon className="size-4 text-mid" strokeWidth={1.5} />
        {gateway ? (
          <div className="text-low">{gateway.settings.label}</div>
        ) : (
          <Placeholder />
        )}
        <div className="grow" />
        <div className="items-center">
          <Profile />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-xl bg-grey-900 py-5 pl-6 lg:flex-row lg:rounded-t-none">
        {gateway ? (
          <>
            <div className="flex grow flex-row items-center gap-2">
              <GatewayIcon className="h-3 w-4" />
              <div className="text-high">{gateway.settings.label}</div>
              {isObserverThisEpoch && (
                <div className="rounded-3xl border px-2 text-sm text-gradient-primary-end">
                  Observer
                </div>
              )}
            </div>
            <div className="flex">
              <div className="pr-6 text-sm text-mid">
                <Link
                  className="flex gap-2 "
                  to={`/gateways/${ownerId}/reports`}
                >
                  <NotebookText className="size-4 text-mid" strokeWidth={1.5} />
                  Reports
                </Link>
              </div>
              <div className="border-l border-grey-400 px-6 text-sm text-mid">
                <Link
                  className="flex gap-2 "
                  to={`/gateways/${ownerId}/observe`}
                >
                  <BinocularsIcon className="size-4" />
                  Observe
                </Link>
              </div>
            </div>
          </>
        ) : (
          <Placeholder />
        )}
      </div>
    </header>
  );
};

export default GatewayHeader;
