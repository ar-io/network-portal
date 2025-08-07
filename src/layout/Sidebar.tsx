import { APP_VERSION, ARIO_DOCS_URL } from '@src/constants';
import useIsMobile from '@src/hooks/useIsMobile';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '@src/components/Button';
import MarkdownModal from '@src/components/modals/MarkdownModal';
import changeLog from '../../CHANGELOG.md?raw';

import SettingsModal from '@src/components/modals/SettingsModal';
import { useGlobalState } from '@src/store';
import { HandCoins, Settings } from 'lucide-react';
import {
  ArioLogoIcon,
  BinocularsIcon,
  CloseDrawerIcon,
  ContractIcon,
  DashboardIcon,
  DocsIcon,
  GatewaysIcon,
  LinkArrowIcon,
  OpenDrawerIcon,
  StakingIcon,
} from '../components/icons';

const ROUTES_PRIMARY = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon className="size-4" />,
    path: '/dashboard',
  },
  {
    title: 'Gateways',
    icon: <GatewaysIcon className="size-4" />,
    path: '/gateways',
  },
  {
    title: 'Staking',
    icon: <StakingIcon className="size-4" />,
    path: '/staking',
  },
  {
    title: 'Observers',
    icon: <BinocularsIcon className="size-4" />,
    path: '/observers',
  },
  {
    title: 'Balances',
    icon: <HandCoins className="size-4" />,
    path: '/balances',
  },
];

const FORMATTED_CHANGELOG = changeLog
  .substring(changeLog.indexOf('## [Unreleased]') + 16)
  .trim()
  .replace(/\[([\w.]+)\]/g, (match, text) => `v${text}`);

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const storedValue = localStorage.getItem('sidebarOpen');
    return storedValue == null ? true : JSON.parse(storedValue);
  });
  const isMobile = useIsMobile();
  const arioProcessId = useGlobalState((state) => state.arioProcessId);

  const [showChangLogModal, setShowChangeLogModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const ROUTES_SECONDARY = [
    {
      title: 'Docs',
      icon: <DocsIcon className="size-4" />,
      path: ARIO_DOCS_URL,
    },
    {
      title: 'Process',
      icon: <ContractIcon className="size-4" />,
      path: `https://www.ao.link/#/entity/${arioProcessId}`,
    },
    {
      title: 'Settings',
      icon: <Settings className="size-4" />,
      action: () => {
        setShowSettingsModal(true);
      },
    },
  ];

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const sideBarClasses = `flex h-full w-fit flex-col p-6
  dark:bg-grey-1000 dark:text-mid ${isMobile ? 'fixed top-0 left-0 z-40 w-64 max-w-[75%] shadow-one' : ''}`;

  return (
    <>
      {isMobile && !sidebarOpen && (
        <button
          className="fixed bottom-4 right-4 z-50 rounded-full bg-containerL3 p-3"
          onClick={() => setSidebarOpen(true)}
        >
          <OpenDrawerIcon className="size-5" />
        </button>
      )}
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          className="fixed inset-0 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {(!isMobile || sidebarOpen) && (
        <aside className={sideBarClasses}>
          {isMobile && (
            <>
              <button
                className="absolute right-4 top-4"
                onClick={() => setSidebarOpen(false)}
              >
                <CloseDrawerIcon className="size-5" />
              </button>
              <button
                className="absolute bottom-4 right-4"
                onClick={() => setSidebarOpen(false)}
              >
                <CloseDrawerIcon className="size-5" />
              </button>
            </>
          )}
          <div className="flex h-9 pb-24">
            <ArioLogoIcon className="h-[1.6875rem] w-[2.125rem]" />
            {sidebarOpen && (
              <div className="pl-3">
                <p className="align-top text-sm leading-none text-neutrals-100">
                  NETWORK PORTAL
                </p>
                <p className="text-xs">by ar.io</p>
              </div>
            )}
          </div>
          <div className="dark:text-grey-100">
            {ROUTES_PRIMARY.map(({ title, icon, path }, index) => (
              <Button
                key={index}
                className="w-full"
                icon={icon}
                title={title}
                text={sidebarOpen ? title : undefined}
                active={location.pathname.startsWith(path)}
                onClick={() => {
                  navigate(path);
                }}
              />
            ))}
          </div>
          <div className="grow"></div>
          <hr className="text-divider" />
          <div className="py-3">
            {ROUTES_SECONDARY.map(({ title, icon, path, action }, index) => (
              <Button
                key={index}
                className="w-full"
                icon={icon}
                rightIcon={
                  action ? <></> : <LinkArrowIcon className="size-3" />
                }
                title={path || title}
                text={sidebarOpen ? title : undefined}
                onClick={
                  action ||
                  (() => {
                    window.open(path, '_blank');
                  })
                }
              />
            ))}
          </div>
          <hr className="text-divider" />
          {!isMobile && (
            <div className="pt-6">
              <div
                className={
                  sidebarOpen
                    ? 'flex items-center justify-end'
                    : 'flex items-center justify-center'
                }
              >
                {sidebarOpen && (
                  <button
                    className="grow pl-3 text-left text-xs text-low/50"
                    onClick={() => setShowChangeLogModal(true)}
                  >
                    v{APP_VERSION}-
                    {import.meta.env.VITE_GITHUB_HASH?.slice(0, 6)}
                  </button>
                )}
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                  {sidebarOpen ? (
                    <CloseDrawerIcon className="size-5" />
                  ) : (
                    <OpenDrawerIcon className="size-5" />
                  )}
                </button>
              </div>
            </div>
          )}
          {showChangLogModal && (
            <MarkdownModal
              onClose={() => setShowChangeLogModal(false)}
              title="Changelog"
              markdownText={FORMATTED_CHANGELOG}
            />
          )}
          {showSettingsModal && (
            <SettingsModal onClose={() => setShowSettingsModal(false)} />
          )}
        </aside>
      )}
    </>
  );
};

export default Sidebar;
