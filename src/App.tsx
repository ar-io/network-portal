import { wrapCreateBrowserRouter } from '@sentry/react';
import React, { Suspense } from 'react';
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';
import "@fontsource/rubik";

import AppRouterLayout from './components/layout/AppRouterLayout';
import NotFound from './pages/NotFound';

const Home = React.lazy(() => import('./pages/Home'));

const sentryCreateBrowserRouter = wrapCreateBrowserRouter(createBrowserRouter);

function App() {
  const router = sentryCreateBrowserRouter(
    createRoutesFromElements(
      <Route element={<AppRouterLayout />} errorElement={<NotFound />}>
        <Route
          index
          element={
            <Suspense
              fallback={<div className="flex flex-row self-center">Loading</div>}
            >
              <Home />
            </Suspense>
          }
        />
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
