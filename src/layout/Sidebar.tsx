import { ARIO_DOCS_URL, IO_PROCESS_INFO_URL } from '@src/constants';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '@src/components/Button';
import MarkdownModal from '@src/components/modals/MarkdownModal';
import changeLog from '../../CHANGELOG.md?raw';

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
];

const ROUTES_SECONDARY = [
  { title: 'Docs', icon: <DocsIcon className="size-4" />, path: ARIO_DOCS_URL },
  {
    title: 'Process',
    icon: <ContractIcon className="size-4" />,
    path: IO_PROCESS_INFO_URL,
  },
];

const FORMATTED_CHANGELOG = changeLog
  .substring(changeLog.indexOf('## [Unreleased]') + 16)
  .trim()
  .replace(/\[([\w.]+)\]/g, (match, text) => {
    console.log(match, text);
    return `v${text}`;
  });

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const storedValue = localStorage.getItem('sidebarOpen');
    return storedValue == null ? true : JSON.parse(storedValue);
  });

  const [showChangLogModal, setShowChangeLogModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const sideBarClasses = `flex h-screen w-fit flex-col p-6
  dark:bg-grey-1000 dark:text-mid`;

  return (
    <aside className={sideBarClasses}>
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
        {ROUTES_SECONDARY.map(({ title, icon, path }, index) => (
          <Button
            key={index}
            className="w-full"
            icon={icon}
            rightIcon={<LinkArrowIcon className="size-3" />}
            title={path}
            text={sidebarOpen ? title : undefined}
            onClick={() => {
              window.open(path, '_blank');
            }}
          />
        ))}
      </div>
      <hr className="text-divider" />
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
              className="grow pl-3 text-xs text-low/50 text-left"
              onClick={() => setShowChangeLogModal(true)}
            >
              v{process.env.npm_package_version}-
              {process.env.VITE_GITHUB_HASH?.slice(0, 6)}
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
      {showChangLogModal && (
        <MarkdownModal
          onClose={() => setShowChangeLogModal(false)}
          title="Changelog"
          markdownText={FORMATTED_CHANGELOG}
        />
      )}
    </aside>
  );
};

export default Sidebar;
