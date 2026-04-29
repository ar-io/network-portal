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
yarn deploy        # Deploy to Arweave (requires VITE_IO_PROCESS_ID, VITE_ARNS_NAME, DEPLOY_KEY env vars)
```

## Code Conventions

- **Formatting**: Biome with single quotes, 2-space indent
- **Commits**: Conventional Commits enforced via commitlint (`feat:`, `fix:`, `chore:`, etc.)
- **Pre-commit**: Husky runs lint-staged which auto-fixes with Biome on `*.{ts,tsx,js,md,json}`
- **Path aliases**: Use `@src/*` for `./src/*` and `@tests/*` for `./tests/*` (configured in both tsconfig.json and vite.config.ts)
- **SVGs**: Import as React components via vite-plugin-svgr; icon components live in `/src/components/icons/` (only barrel export in the project)

## High-Level Architecture

### Provider Stack (App.tsx)

Components wrap in this order (outermost first):
`WagmiProvider` → `QueryClientProvider` → `GlobalDataProvider` → `WalletProvider` → `MathJaxContext` → `RouterProvider`

### State Management

- **Zustand** for global state:
  - `useGlobalState` (`/src/store/globalState.ts`) - wallet info, SDK instances, current epoch, block height, theme
  - `useSettings` (`/src/store/settings.ts`) - user-configurable settings (AO CU URL, ARIO process ID)
  - `useColumnPreferences` (`/src/store/columnPreferences.ts`) - table column visibility
- **React Query** for server state with 5-minute default cache time
- **IndexedDB** (via Dexie) for persistent caching of observations and epochs (`/src/store/db.ts`)

### Data Fetching Pattern

45+ custom hooks in `/src/hooks/` follow this pattern:

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
- Wagmi config handles Ethereum chain interactions (mainnet only)

### App Initialization

`GlobalDataProvider` handles app-wide data initialization:
- Fetches current epoch and ticker on load
- Updates block height every 2 minutes
- Monitors AO CU URL for congestion (5s threshold)
- Cleans up stale IndexedDB cache

### Routing

- Hash-based routing (`createHashRouter`) with React Router v6, wrapped by Sentry
- All route components lazy-loaded with `React.lazy()` except Dashboard
- Routes: `/dashboard`, `/gateways`, `/gateways/:ownerId`, `/gateways/:ownerId/reports`, `/gateways/:ownerId/reports/:reportId`, `/gateways/:ownerId/observe`, `/staking`, `/observers`, `/balances`, `/balances/:walletAddress`, `/extensions`

### Key Domain Concepts

- **Gateways**: Network nodes that serve data, can be staked to
- **Staking**: ARIO token staking/delegation to gateways
- **Observers**: Monitor gateway performance and generate reports
- **Epochs**: Time periods for rewards and assessments
- **Vaults**: Token locking for withdrawals

### Important Directories

- `/src/components/` - Reusable UI components (flat structure with `/forms`, `/modals`, `/panels`, `/charts` subdirs)
- `/src/hooks/` - Data fetching and business logic hooks
- `/src/pages/` - Route page components (one directory per page with `index.tsx`)
- `/src/services/` - External service integrations (Sentry, wallet connectors)
- `/src/store/` - Zustand state management
- `/src/utils/` - Helper functions
- `/tokens/` - Design token definitions (primitives.json consumed by Tailwind config)
- `/tests/` - Test files (some also co-located in `/src/`)

### Testing

- Vitest with globals enabled (no need to import `describe`, `it`, `expect`, etc.)
- Separate `vitest.config.ts` for test configuration
- Coverage thresholds: 80% for branches, functions, and lines

### Development Notes

- Node.js 20.12.2 required (see `.nvmrc`)
- Environment variables use `VITE_` prefix
- Pre-commit hooks run Biome via Husky
- CI/CD deploys to GitHub Pages (staging) and Arweave (production)
- Tailwind CSS with custom design tokens in `/tokens/`, Rubik font, dark mode support
