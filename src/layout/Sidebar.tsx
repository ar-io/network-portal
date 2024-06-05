import { ARIO_DOCS_URL, IO_PROCESS_INFO_URL } from '@src/constants';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '@src/components/Button';
import {
  ArioLogoIcon,
  CloseDrawerIcon,
  ContractIcon,
  DocsIcon,
  GatewaysIcon,
  LinkArrowIcon,
  OpenDrawerIcon,
  StakingIcon,
} from '../components/icons';

const ROUTES_PRIMARY = [
  // { title: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { title: 'Gateways', icon: <GatewaysIcon />, path: '/gateways' },
  { title: 'Staking', icon: <StakingIcon />, path: '/staking' },
  // { title: 'Observers', icon: <BinocularsIcon />, path: '/observers' },
];

const ROUTES_SECONDARY = [
  { title: 'Docs', icon: <DocsIcon />, path: ARIO_DOCS_URL },
  { title: 'Process', icon: <ContractIcon />, path: IO_PROCESS_INFO_URL },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const storedValue = localStorage.getItem('sidebarOpen');
    return storedValue == null ? true : JSON.parse(storedValue);
  });

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const sideBarClasses = `flex h-screen w-[${sidebarOpen ? '264px' : '90px'}] flex-col p-[24px]
  dark:bg-grey-1000 dark:text-mid`;

  return (
    <aside className={sideBarClasses}>
      <div className="flex h-[36px] pb-[64px]">
        <ArioLogoIcon />
        {sidebarOpen && (
          <div className="pl-[12px]">
            <p className="align-top text-[14px] leading-none text-neutrals-100">
              NETWORK PORTAL
            </p>
            <p className="text-[12px]">by ar.io</p>
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
      <div className="py-[12px]">
        {ROUTES_SECONDARY.map(({ title, icon, path }, index) => (
          <Button
            key={index}
            className="w-full"
            icon={icon}
            rightIcon={<LinkArrowIcon />}
            title={path}
            text={sidebarOpen ? title : undefined}
            onClick={() => {
              window.open(path, '_blank');
            }}
          />
        ))}
      </div>
      <hr className="text-divider" />
      <div className="pt-[24px]">
        <div
          className={sidebarOpen ? 'flex justify-end' : 'flex justify-center'}
        >
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <CloseDrawerIcon /> : <OpenDrawerIcon />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
