import '@fontsource/rubik';
import { wrapCreateBrowserRouter } from '@sentry/react';
import React, { Suspense } from 'react';
import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import GlobalDataProvider from './components/GlobalDataProvider';
import WalletProvider from './components/WalletProvider';
import AppRouterLayout from './layout/AppRouterLayout';
import Loading from './pages/Loading';
import NotFound from './pages/NotFound';
import Gateway from './pages/Gateway';

// const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Gateways = React.lazy(() => import('./pages/Gateways'));
// const Staking = React.lazy(() => import('./pages/Staking'));
// const Observers = React.lazy(() => import('./pages/Observers'));

const sentryCreateBrowserRouter = wrapCreateBrowserRouter(createBrowserRouter);

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
        {/* <Route
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
        , */}
        <Route path="*" element={<Navigate to="/" />} />
      </Route>,
    ),
  );

  return (
    <GlobalDataProvider>
      <WalletProvider>
        <RouterProvider router={router} />
      </WalletProvider>
    </GlobalDataProvider>
  );
}

export default App;
