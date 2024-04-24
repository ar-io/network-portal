import { Outlet } from 'react-router-dom';

import Notifications from './Notifications';
import SideBar from './SideBar';

function AppRouterLayout() {
  return (
    <div className="h-screen w-screen dark:bg-grey-1000 dark:text-grey-100">
      <div className="flex pr-[24px]">
        <SideBar />
        <div className="grow">
          <Outlet />
        </div>
      </div>
      <Notifications />
    </div>
  );
}

export default AppRouterLayout;
