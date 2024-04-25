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

import AppRouterLayout from './layout/AppRouterLayout.js';
import Loading from './pages/Loading.js';
import NotFound from './pages/NotFound.js';

const Dashboard = React.lazy(() => import('./pages/Dashboard.js'));
const Gateways = React.lazy(() => import('./pages/Gateways.js'));
const Staking = React.lazy(() => import('./pages/Staking.js'));
const Observers = React.lazy(() => import('./pages/Observers.js'));

const sentryCreateBrowserRouter = wrapCreateBrowserRouter(createBrowserRouter);

function App() {
  const router = sentryCreateBrowserRouter(
    createRoutesFromElements(
      <Route element={<AppRouterLayout />} errorElement={<NotFound />}>
        <Route index path="/" element={<Navigate to="/dashboard" />} />
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<Loading />}>
              <Dashboard />
            </Suspense>
          }
        />
        ,
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
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
