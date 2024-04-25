import { ARIO_DOCS_URL, GATEWAY_CONTRACT_URL } from '@src/constants';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
import Button from '@src/components/Button';

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
  dark:bg-grey-1000 dark:text-textMid`;

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
        <Button
          className="w-full"
          icon={<DashboardIcon />}
          title="Dashboard"
          text={sidebarOpen ? 'Dashboard' : undefined}
          active={location.pathname.startsWith('/dashboard')}
          onClick={() => {
            navigate('/dashboard');
          }}
        />
        <Button
          className="w-full"
          icon={<GatewaysIcon />}
          title="Gateways"
          text={sidebarOpen ? 'Gateways' : undefined}
          active={location.pathname.startsWith('/gateways')}
          onClick={() => {
            navigate('/gateways');
          }}
        />
        <Button
          className="w-full"
          icon={<StakingIcon />}
          title="Staking"
          text={sidebarOpen ? 'Staking' : undefined}
          active={location.pathname.startsWith('/staking')}
          onClick={() => {
            navigate('/staking');
          }}
        />
        <Button
          className="w-full"
          icon={<BinocularsIcon />}
          title="Observers"
          text={sidebarOpen ? 'Observers' : undefined}
          active={location.pathname.startsWith('/observers')}
          onClick={() => {
            navigate('/observers');
          }}
        />
      </div>
      <div className="grow"></div>
      <hr className="text-divider" />
      <div className="py-[12px]">
        <Button
          className="w-full"
          icon={<DocsIcon />}
          title="Docs"
          text={sidebarOpen ? 'Docs' : undefined}
          rightIcon={<LinkArrowIcon />}
          active={false}
          onClick={() => {
            window.open(ARIO_DOCS_URL, '_blank');
          }}
        />
        <Button
          className="w-full"
          icon={<ContractIcon />}
          title="Contract"
          text={sidebarOpen ? 'Contract' : undefined}
          rightIcon={<LinkArrowIcon />}
          active={false}
          onClick={() => {
            window.open(GATEWAY_CONTRACT_URL, '_blank');
          }}
        />
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
