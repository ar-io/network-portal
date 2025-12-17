import { APP_VERSION, ARIO_DOCS_URL, ARIO_PROCESS_ID } from '@src/constants';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '@src/components/Button';
import MarkdownModal from '@src/components/modals/MarkdownModal';
import changeLog from '../../CHANGELOG.md?raw';

import SettingsModal from '@src/components/modals/SettingsModal';
import { updateSettings, useGlobalState, useSettings } from '@src/store';
import { Globe, HandCoins, Menu, Puzzle, Settings } from 'lucide-react';
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
  {
    title: 'Extensions',
    icon: <Puzzle className="size-4" />,
    path: '/extensions',
  },
];

const FORMATTED_CHANGELOG = changeLog
  .substring(changeLog.indexOf('## [Unreleased]') + 16)
  .trim()
  .replace(/\[([\w.]+)\]/g, (_match, text) => `v${text}`);

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarOpen = useSettings((state) => state.sidebarOpen);
  const aoCongested = useGlobalState((state) => state.aoCongested);

  const [showChangLogModal, setShowChangeLogModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const ROUTES_SECONDARY = [
    {
      title: 'Explorer',
      icon: <Globe className="size-4" />,
      path: `https://scan.ar.io`,
    },
    {
      title: 'Docs',
      icon: <DocsIcon className="size-4" />,
      path: ARIO_DOCS_URL,
    },
    {
      title: 'Process',
      icon: <ContractIcon className="size-4" />,
      path: `https://scan.ar.io/entity/${ARIO_PROCESS_ID.toString()}`,
    },
    {
      title: 'Settings',
      icon: <Settings className="size-4" />,
      action: () => {
        setShowSettingsModal(true);
      },
    },
  ];

  const isMobile = useGlobalState((state) => state.isMobile);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  // Only show toggle button on desktop
  const showToggleButton = !isMobile;

  const sideBarClasses = `fixed lg:sticky top-0 left-0 z-40 h-screen flex flex-col p-6
    dark:bg-grey-1000 dark:text-mid transition-transform duration-300 ease-in-out
    w-fit lg:max-w-48
    ${isMobile && !isMobileOpen ? '-translate-x-full' : 'translate-x-0'}
    lg:translate-x-0`;

  // Mobile menu button (only visible on mobile)
  const mobileMenuButton = isMobile && !isMobileOpen && (
    <button
      onClick={toggleMobileMenu}
      onKeyDown={(e) => e.key === 'Enter' && toggleMobileMenu()}
      className={`fixed left-4 ${aoCongested ? 'top-[4.5rem]' : 'top-4'} z-50 rounded-md p-2 text-grey-100 focus:outline-none focus:ring-2 focus:ring-grey-100 lg:hidden`}
      aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isMobileOpen}
      aria-controls="sidebar-navigation"
    >
      {!isMobileOpen && <Menu className="size-6" />}
    </button>
  );

  // Overlay for mobile (only shown when sidebar is open on mobile)
  const overlay = isMobile && isMobileOpen && (
    <div
      className="fixed inset-0 z-30 bg-grey-900/50 lg:hidden"
      onClick={closeMobileMenu}
      onKeyDown={(e) => e.key === 'Escape' && closeMobileMenu()}
      role="button"
      tabIndex={0}
      aria-label="Close menu"
    />
  );

  return (
    <>
      {mobileMenuButton}
      {overlay}
      <aside
        className={sideBarClasses}
        id="sidebar-navigation"
        aria-label="Main navigation"
      >
        <div className="flex pb-[3.25rem]">
          <ArioLogoIcon className="h-[1.6875rem] w-[2.125rem]" />
          {(sidebarOpen || isMobileOpen) && (
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
              text={sidebarOpen || isMobileOpen ? title : undefined}
              active={location.pathname.startsWith(path)}
              onClick={() => {
                navigate(path);
                closeMobileMenu();
              }}
            />
          ))}
        </div>
        <div className="grow"></div>
        <hr className="text-divider" />
        <div className="py-3">
          {ROUTES_SECONDARY.map(({ title, icon, path, action }, index) => {
            const handleClick = () => {
              if (action) {
                action();
              } else {
                window.open(path, '_blank');
              }
              closeMobileMenu();
            };

            return (
              <Button
                key={index}
                className="w-full"
                icon={icon}
                rightIcon={
                  action ? <></> : <LinkArrowIcon className="size-3" />
                }
                title={path || title}
                text={sidebarOpen || isMobileOpen ? title : undefined}
                onClick={handleClick}
              />
            );
          })}
        </div>
        <hr className="text-divider" />
        <div className="pt-6">
          <div
            className={
              sidebarOpen || isMobileOpen
                ? 'flex items-center justify-end'
                : 'flex items-center justify-center'
            }
          >
            {(sidebarOpen || isMobileOpen) && (
              <button
                className="grow pl-3 text-left text-xs text-low/50"
                onClick={() => {
                  setShowChangeLogModal(true);
                  closeMobileMenu();
                }}
              >
                v{APP_VERSION}-{import.meta.env.VITE_GITHUB_HASH?.slice(0, 6)}
              </button>
            )}

            {showToggleButton && (
              <button
                onClick={() => updateSettings({ sidebarOpen: !sidebarOpen })}
                className="shrink-0"
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? (
                  <CloseDrawerIcon className="size-5" />
                ) : (
                  <OpenDrawerIcon className="size-5" />
                )}
              </button>
            )}
          </div>
        </div>
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
    </>
  );
};

export default Sidebar;
