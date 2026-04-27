import AnnouncementBanner from '@src/components/AnnouncementBanner';
import NetworkStatusBanner from '@src/components/NetworkStatusBanner';
import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function AppRouterLayout() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden dark:bg-grey-1000 dark:text-grey-100">
      <AnnouncementBanner />
      <NetworkStatusBanner />
      <div className="relative flex min-h-0 flex-1">
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
