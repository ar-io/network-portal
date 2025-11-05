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

import { MathJaxContext } from 'better-react-mathjax';
import { http, WagmiProvider, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';
import GlobalDataProvider from './components/GlobalDataProvider';
import WalletProvider from './components/WalletProvider';
import AppRouterLayout from './layout/AppRouterLayout';
import Dashboard from './pages/Dashboard';
import Loading from './pages/Loading';
import NotFound from './pages/NotFound';

// Main Pages
// const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Gateways = React.lazy(() => import('./pages/Gateways'));
const Gateway = React.lazy(() => import('./pages/Gateway'));
const Staking = React.lazy(() => import('./pages/Staking'));
const Observers = React.lazy(() => import('./pages/Observers'));
const BalancesMain = React.lazy(() => import('./pages/Balances'));
const BalancesForAddress = React.lazy(
  () => import('./pages/Balances/BalancesForAddress'),
);
const Extensions = React.lazy(() => import('./pages/Extensions/Extensions'));

// Sub-Pages
const Reports = React.lazy(() => import('./pages/Reports'));
const Report = React.lazy(() => import('./pages/Report'));
const Observe = React.lazy(() => import('./pages/Observe'));

const sentryCreateBrowserRouter = wrapCreateBrowserRouter(createHashRouter);

const queryClient = new QueryClient();

// Wagmi setup
const config = createConfig({
  chains: [mainnet],
  connectors: [
    metaMask({
      extensionOnly: true,
      injectProvider: false,
      dappMetadata: { name: 'Network Portal by ar.io', iconUrl: './ario.svg' },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
  },
});

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
          path="gateways/:ownerId/reports/:reportId"
          element={
            <Suspense fallback={<Loading />}>
              <Report />
            </Suspense>
          }
        />
        ,
        <Route
          path="gateways/:ownerId/reports"
          element={
            <Suspense fallback={<Loading />}>
              <Reports />
            </Suspense>
          }
        />
        ,
        <Route
          path="gateways/:ownerId/observe"
          element={
            <Suspense fallback={<Loading />}>
              <Observe />
            </Suspense>
          }
        />
        ,
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
        <Route
          path="balances/:walletAddress"
          element={
            <Suspense fallback={<Loading />}>
              <BalancesForAddress />
            </Suspense>
          }
        />
        ,
        <Route
          path="balances"
          element={
            <Suspense fallback={<Loading />}>
              <BalancesMain />
            </Suspense>
          }
        />
        ,
        <Route
          path="extensions"
          element={
            <Suspense fallback={<Loading />}>
              <Extensions />
            </Suspense>
          }
        />
        ,
        <Route path="*" element={<Navigate to="/" />} />
      </Route>,
    ),
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <GlobalDataProvider>
          <WalletProvider>
            <MathJaxContext>
              <RouterProvider router={router} />
            </MathJaxContext>
          </WalletProvider>
        </GlobalDataProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
