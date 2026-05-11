import '@fontsource/rubik';
import { wrapCreateBrowserRouter } from '@sentry/react';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, useMemo } from 'react';
import {
  Navigate,
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { MathJaxContext } from 'better-react-mathjax';
import GlobalDataProvider from './components/GlobalDataProvider';
import WalletBridge from './components/WalletBridge';
import AppRouterLayout from './layout/AppRouterLayout';
import Dashboard from './pages/Dashboard';
import Loading from './pages/Loading';
import NotFound from './pages/NotFound';
import { useSettings } from './store';

import '@solana/wallet-adapter-react-ui/styles.css';

// Main Pages
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

/**
 * The Solana SDK instance (`SolanaARIOReadable`) is used in React Query keys
 * across all hooks so queries invalidate when the RPC endpoint changes.
 * `JSON.stringify` chokes on the `Connection` object (circular refs), so we
 * provide a safe hash function that replaces non-serializable values with a
 * stable identity string.
 */
function safeQueryKeyHashFn(queryKey: readonly unknown[]): string {
  return JSON.stringify(
    queryKey,
    (() => {
      const seen = new WeakSet();
      return (_key: string, value: unknown) => {
        if (typeof value === 'object' && value !== null) {
          // Use rpcEndpoint as stable identity for Connection objects
          if (
            'rpcEndpoint' in value &&
            typeof (value as any).rpcEndpoint === 'string'
          ) {
            return (value as any).rpcEndpoint;
          }
          if (seen.has(value)) return '[circular]';
          seen.add(value);
        }
        return value;
      };
    })(),
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: safeQueryKeyHashFn,
    },
  },
});

function App() {
  const solanaRpcUrl = useSettings((state) => state.solanaRpcUrl);
  // Empty array: modern wallets (Phantom ≥1.3, Solflare, Backpack) self-register
  // via the Wallet Standard protocol. Explicitly providing PhantomWalletAdapter
  // causes a duplicate-registration console warning.
  const wallets = useMemo(() => [], []);

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
    <ConnectionProvider endpoint={solanaRpcUrl}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <GlobalDataProvider>
              <WalletBridge>
                <MathJaxContext>
                  <RouterProvider router={router} />
                </MathJaxContext>
              </WalletBridge>
            </GlobalDataProvider>
          </QueryClientProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

export default App;
