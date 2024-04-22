import { Outlet } from 'react-router-dom';

import Notifications from './Notifications';
import SideBar from './SideBar';

function AppRouterLayout() {
  return (
    <div className="h-screen w-screen">
      <div className="flex">
        <SideBar  />
        <div>
          <Outlet />
        </div>
      </div>
      <Notifications />
    </div>
  );
}

export default AppRouterLayout;
