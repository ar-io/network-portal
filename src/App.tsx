import '@fontsource/rubik';
import { wrapCreateBrowserRouter } from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import {
  Navigate,
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import GlobalDataProvider from './components/GlobalDataProvider';
import WalletProvider from './components/WalletProvider';
import AppRouterLayout from './layout/AppRouterLayout';
import Loading from './pages/Loading';
import NotFound from './pages/NotFound';

// Main Pages
// const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Gateways = React.lazy(() => import('./pages/Gateways'));
const Gateway = React.lazy(() => import('./pages/Gateway'));
const Staking = React.lazy(() => import('./pages/Staking'));
const Observers = React.lazy(() => import('./pages/Observers'));

// Sub-Pages
const Reports = React.lazy(() => import('./pages/Reports'));
const Report = React.lazy(() => import('./pages/Report'));
const Observe = React.lazy(() => import('./pages/Observe'));

const sentryCreateBrowserRouter = wrapCreateBrowserRouter(createHashRouter);

const queryClient = new QueryClient();

function App() {
  const router = sentryCreateBrowserRouter(
    createRoutesFromElements(
      <Route element={<AppRouterLayout />} errorElement={<NotFound />}>
        <Route index path="/" element={<Navigate to="/gateways" />} />
        {/* <Route
          path="dashboard"
          element={
            <Suspense fallback={<Loading />}>
              <Dashboard />
            </Suspense>
          }
        />
        , */}
        <Route
          path="gateways/:ownerId/reports/:reportId"
          element={
            <Suspense fallback={<Loading />}>
              <Report />
            </Suspense>
          }
        />,
        <Route
          path="gateways/:ownerId/reports"
          element={
            <Suspense fallback={<Loading />}>
              <Reports />
            </Suspense>
          }
        />,
        <Route
          path="gateways/:ownerId/observe"
          element={
            <Suspense fallback={<Loading />}>
              <Observe />
            </Suspense>
          }
        />,
        <Route
          path="gateways/:ownerId"
          element={
            <Suspense fallback={<Loading />}>
              <Gateway />
            </Suspense>
          }
        />
        <Route
          path="gateways"
          element={
            <Suspense fallback={<Loading />}>
              <Gateways />
            </Suspense>
          }
        />
        ,
         <Route
          path="staking"
          element={
            <Suspense fallback={<Loading />}>
              <Staking />
            </Suspense>
          }
        />
        ,
        <Route
          path="observers"
          element={
            <Suspense fallback={<Loading />}>
              <Observers />
            </Suspense>
          }
        />
        ,
        <Route path="*" element={<Navigate to="/" />} />
      </Route>,
    ),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalDataProvider>
        <WalletProvider>
          <RouterProvider router={router} />
        </WalletProvider>
      </GlobalDataProvider>
    </QueryClientProvider>
  );
}

export default App;
