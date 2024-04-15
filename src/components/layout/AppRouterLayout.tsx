import { Outlet } from 'react-router-dom';

import Notifications from './Notifications';

function AppRouterLayout() {
  return (
    <>
      <Outlet />
      <Notifications />
    </>
  );
}

export default AppRouterLayout;
