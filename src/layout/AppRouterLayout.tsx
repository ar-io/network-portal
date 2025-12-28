import NetworkStatusBanner from '@src/components/NetworkStatusBanner';
import { useGlobalState } from '@src/store';
import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function AppRouterLayout() {
  const aoCongested = useGlobalState((state) => state.aoCongested);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden dark:bg-grey-1000 dark:text-grey-100">
      <NetworkStatusBanner />
      <div
        className={`flex h-full ${aoCongested ? 'h-[calc(100vh-2rem)]' : ''}`}
      >
        <Sidebar />
        <main className="flex-1 overflow-hidden lg:pl-0">
          <Outlet />
        </main>
      </div>
      <Toaster
        containerStyle={{ position: 'fixed', zIndex: 99999 }}
        position="bottom-right"
      />
    </div>
  );
}

export default AppRouterLayout;
