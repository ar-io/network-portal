import { Outlet } from 'react-router-dom';

import Notifications from './Notifications.js';
import Sidebar from './Sidebar.js';

function AppRouterLayout() {
  return (
    <div className="h-screen w-screen dark:bg-grey-1000 dark:text-grey-100">
      <div className="flex pr-[24px]">
        <Sidebar />
        <div className="grow">
          <Outlet />
        </div>
      </div>
      <Notifications />
    </div>
  );
}

export default AppRouterLayout;
