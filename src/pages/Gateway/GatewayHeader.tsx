import { Gateway } from '@ar.io/sdk/web';
import Placeholder from '@src/components/Placeholder';
import Profile from '@src/components/Profile';
import { BinocularsIcon, GatewayIcon } from '@src/components/icons';
import { MOBILE_MENU_CLEARANCE } from '@src/layout/mobileMenu';
import { useGlobalState } from '@src/store';
import { ChevronRightIcon, NotebookText } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

const GatewayHeader = ({ gateway }: { gateway?: Gateway | null }) => {
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
      <div
        className={`flex min-w-0 items-center gap-3 py-5 text-sm lg:pr-4 ${MOBILE_MENU_CLEARANCE}`}
      >
        <div className="shrink-0 text-mid">
          <Link to={'/gateways'}>Gateways</Link>
        </div>
        {/*
          The trailing crumb is the page's own name, which the panel directly
          below states in full and in larger type. On a phone it competed with
          the Connect button for what little room is left and lost, rendering
          "Perma…." for a twelve-character name — so the trail stops at the
          parent, which is the part that does something: going back.
        */}
        <ChevronRightIcon
          className="hidden size-4 shrink-0 text-mid lg:block"
          strokeWidth={1.5}
        />
        {gateway ? (
          <div className="hidden truncate text-low lg:block">
            {gateway.settings.label}
          </div>
        ) : (
          <Placeholder className="hidden lg:block" />
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
