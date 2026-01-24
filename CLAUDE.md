# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Install dependencies (use frozen lockfile)
yarn install --frozen-lockfile

# Start development server
yarn dev

# Run tests
yarn test                          # Run all tests once
yarn vitest                        # Run tests in watch mode
yarn vitest path/to/test.test.ts   # Run a single test file

# Code quality (uses Biome for linting and formatting)
yarn lint:check    # Check for linting issues
yarn lint:fix      # Fix linting and formatting issues automatically
yarn format:check  # Check formatting only
yarn format:fix    # Fix formatting only
yarn tsc --noEmit  # Type check without building

# Build and deploy
yarn build         # Production build
yarn deploy        # Deploy to Arweave (requires env vars)
```

## High-Level Architecture

### State Management

- **Zustand** for global state with two stores:
  - `useGlobalState` (`/src/store/globalState.ts`) - wallet info, SDK instances, current epoch, block height, theme
  - `useSettings` (`/src/store/settings.ts`) - user-configurable settings (AO CU URL, ARIO process ID)
- **React Query** for server state with 5-minute default cache time
- **IndexedDB** (via Dexie) for persistent caching of observations and epochs (`/src/store/db.ts`)

### Data Fetching Pattern

All data fetching uses custom hooks in `/src/hooks/` following this pattern:

```typescript
const useDataHook = (params) => {
  const sdk = useGlobalState((state) => state.arIOReadSDK);
  return useQuery({
    queryKey: ['keyName', ...deps],
    queryFn: async () => {
      /* SDK call */
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!requiredDeps,
  });
};
```

### SDK Integration

- Uses `@ar.io/sdk` for all ar.io network interactions
- `arIOReadSDK` for read operations (available without wallet)
- `arIOWriteableSDK` for write operations (requires connected wallet with signer)
- SDKs are reinstantiated when settings change (AO CU URL or ARIO process ID)

### Multi-Wallet Architecture

- Supports Wander (Arweave), MetaMask (Ethereum), and Beacon wallets
- Wallet connectors in `/src/services/wallets/` implement `NetworkPortalWalletConnector` interface
- `WalletProvider` component handles wallet connection lifecycle and events
- Wallet type persisted in localStorage

### App Initialization

`GlobalDataProvider` handles app-wide data initialization:
- Fetches current epoch and ticker on load
- Updates block height every 2 minutes
- Monitors AO CU URL for congestion (5s threshold)
- Cleans up stale IndexedDB cache

### Routing

- Hash-based routing with React Router v6
- Lazy-loaded route components
- Main routes: `/dashboard`, `/gateways`, `/gateways/:ownerId`, `/staking`, `/observers`, `/balances`, `/extensions`
- Nested routes for reports: `/gateways/:ownerId/reports`, `/gateways/:ownerId/reports/:reportId`

### Key Domain Concepts

- **Gateways**: Network nodes that serve data, can be staked to
- **Staking**: ARIO token staking/delegation to gateways
- **Observers**: Monitor gateway performance and generate reports
- **Epochs**: Time periods for rewards and assessments
- **Vaults**: Token locking for withdrawals

### Important Directories

- `/src/components/` - Reusable UI components
- `/src/hooks/` - Data fetching and business logic hooks
- `/src/pages/` - Route page components (organized by feature)
- `/src/services/` - External service integrations
- `/src/store/` - Zustand state management
- `/src/utils/` - Helper functions
- `/tests/` - Test files (also some co-located in `/src/`)

### Development Notes

- Node.js 20.12.2 required (see `.nvmrc`)
- Environment variables use `VITE_` prefix
- Pre-commit hooks run Biome via Husky
- CI/CD deploys to GitHub Pages (staging) and Arweave (production)
- Uses Tailwind CSS with custom design tokens in `/tokens/`
