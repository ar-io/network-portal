import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function AppRouterLayout() {
  return (
    <div className="h-screen w-screen dark:bg-grey-1000 dark:text-grey-100">
      <div className="flex pr-[24px]">
        <Sidebar />
        <div className="grow">
          <Outlet />
        </div>
      </div>
      <Toaster
        containerStyle={{ position: 'fixed', zIndex: 99999 }}
        position="bottom-right"
      />
    </div>
  );
}

export default AppRouterLayout;
