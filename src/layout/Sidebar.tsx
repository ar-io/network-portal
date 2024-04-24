import { ARIO_DOCS_URL, GATEWAY_CONTRACT_URL } from '@src/constants';
import { MouseEventHandler, ReactElement, useEffect, useState } from 'react';
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

const SideBarButton = ({
  icon,
  title,
  text,
  rightIcon = undefined,
  isOpen,
  active,
  onClick,
}: {
  icon: ReactElement;
  title: string;
  text: string;
  rightIcon?: ReactElement;
  isOpen: boolean;
  active: boolean;
  onClick: MouseEventHandler;
}) => {
  const classNames = active
    ? 'flex h-[34px] w-full items-center space-x-[11px] px-[11px] py-[5px] rounded-[6px] bg-gradient-to-b shadow-[0px_0px_0px_1px_#050505,0px_1px_0px_0px_rgba(86,86,86,0.25)_inset] dark:from-[rgba(102,102,102,.06)] dark:to-[rgba(0,0,0,0.06)] dark:bg-[#212124]'
    : 'flex h-[34px] w-full items-center space-x-[11px] px-[11px] py-[5px] hover:rounded-[6px] hover:bg-gradient-to-b hover:shadow-[0px_0px_0px_1px_#050505,0px_1px_0px_0px_rgba(86,86,86,0.25)_inset] dark:from-[rgba(102,102,102,.06)] dark:to-[rgba(0,0,0,0.06)] hover:dark:bg-[#212124]';

  return (
    <button
      title={title}
      className={classNames}
      onClick={active ? undefined : onClick}
    >
      {icon}
      {isOpen && (
        <div className="flex grow items-center space-x-[4px] text-left text-[14px]">
          {text} {rightIcon}
        </div>
      )}
    </button>
  );
};

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
  dark:bg-grey-1000 dark:text-grey-300`;

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
        <SideBarButton
          icon={<DashboardIcon />}
          title="Dashboard"
          text="Dashboard"
          isOpen={sidebarOpen}
          active={location.pathname.startsWith('/dashboard')}
          onClick={() => {
            navigate('/dashboard');
          }}
        />
        <SideBarButton
          icon={<GatewaysIcon />}
          title="Gateways"
          text="Gateways"
          isOpen={sidebarOpen}
          active={location.pathname.startsWith('/gateways')}
          onClick={() => {
            navigate('/gateways');
          }}
        />
        <SideBarButton
          icon={<StakingIcon />}
          title="Staking"
          text="Staking"
          isOpen={sidebarOpen}
          active={location.pathname.startsWith('/staking')}
          onClick={() => {
            navigate('/staking');
          }}
        />
        <SideBarButton
          icon={<BinocularsIcon />}
          title="Observers"
          text="Observers"
          isOpen={sidebarOpen}
          active={location.pathname.startsWith('/observers')}
          onClick={() => {
            navigate('/observers');
          }}
        />
      </div>
      <div className="grow"></div>
      <hr className="text-[#232329]" />
      <div className="py-[12px]">
        <SideBarButton
          icon={<DocsIcon />}
          title="Docs"
          text="Docs"
          rightIcon={<LinkArrowIcon />}
          isOpen={sidebarOpen}
          active={false}
          onClick={() => {
            window.open(ARIO_DOCS_URL, '_blank');
          }}
        />
        <SideBarButton
          icon={<ContractIcon />}
          title="Contract"
          text="Contract"
          rightIcon={<LinkArrowIcon />}
          isOpen={sidebarOpen}
          active={false}
          onClick={() => {
            window.open(GATEWAY_CONTRACT_URL, '_blank');
          }}
        />
      </div>
      <hr className="text-[#232329]" />
      <div className="pt-[24px]">
        <div className={sidebarOpen ? 'flex justify-end' : 'flex justify-center'}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <CloseDrawerIcon /> : <OpenDrawerIcon />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
