import NetworkStatusBanner from '@src/components/NetworkStatusBanner';
import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useGlobalState } from '@src/store';

function AppRouterLayout() {

  const aoCongested = useGlobalState((state) => state.aoCongested);

  return (
    <div className="flex h-screen w-screen flex-col overflow-x-auto overflow-y-hidden scrollbar dark:bg-grey-1000 dark:text-grey-100">
      <NetworkStatusBanner />
      <div className={`flex ${aoCongested ? 'h-[calc(100vh-2rem)]' : 'h-full'}`}>
        <Sidebar />
        <div className="size-full grow overflow-y-auto pr-6 scrollbar">
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
