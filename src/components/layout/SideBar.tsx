import { MouseEventHandler, ReactElement, useState } from 'react';

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
} from '../icons';

const SideBarButton = ({
  icon,
  text,
  rightIcon = undefined,
  isOpen,
  onClick,
}: {
  icon: ReactElement;
  text: string;
  rightIcon?: ReactElement;
  isOpen: boolean;
  onClick: MouseEventHandler;
}) => {
  return (
    <button
      className="flex h-[34px] w-full items-center space-x-[11px] 
      px-[11px] py-[5px] hover:rounded-[6px] hover:bg-gradient-to-b 
      hover:shadow-[0px_0px_0px_1px_#050505,0px_1px_0px_0px_rgba(86,86,86,0.25)_inset] dark:from-[rgba(102,102,102,.06)] 
      dark:to-[rgba(0,0,0,0.06)] hover:dark:bg-[#212124]"
      onClick={onClick}
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

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const sideBarClasses = `flex h-screen w-[${isOpen ? '264px' : '90px'}] flex-col p-[24px]
  dark:bg-grey-1000 dark:text-grey-300`;

  return (
    <aside className={sideBarClasses}>
      <div className="flex h-[36px] pb-[64px]">
        <ArioLogoIcon />
        {isOpen && (
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
          text="Dashboard"
          isOpen={isOpen}
          onClick={() => {}}
        />
        <SideBarButton
          icon={<GatewaysIcon />}
          text="Gateways"
          isOpen={isOpen}
          onClick={() => {}}
        />
        <SideBarButton
          icon={<StakingIcon />}
          text="Staking"
          isOpen={isOpen}
          onClick={() => {}}
        />
        <SideBarButton
          icon={<BinocularsIcon />}
          text="Observers"
          isOpen={isOpen}
          onClick={() => {}}
        />
      </div>
      <div className="grow"></div>
      <hr className="text-[#232329]" />
      <div className="py-[12px]">
        <SideBarButton
          icon={<DocsIcon />}
          text="Docs"
          rightIcon={<LinkArrowIcon />}
          isOpen={isOpen}
          onClick={() => {}}
        />
        <SideBarButton
          icon={<ContractIcon />}
          text="Contract"
          rightIcon={<LinkArrowIcon />}
          isOpen={isOpen}
          onClick={() => {}}
        />
      </div>
      <hr className="text-[#232329]" />
      <div className="pt-[24px]">
        <div className={isOpen ? 'flex justify-end' : 'flex justify-center'}>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <CloseDrawerIcon /> : <OpenDrawerIcon />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
