# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Install dependencies (use frozen lockfile)
yarn install --frozen-lockfile

# Start development server (defaults to Solana devnet via .env.local)
yarn dev

# Start with localnet configuration
yarn dev:localnet

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
`ConnectionProvider` → `SolanaWalletProvider` → `WalletModalProvider` → `QueryClientProvider` → `GlobalDataProvider` → `WalletBridge` → `MathJaxContext` → `RouterProvider`

### Solana Integration

The app runs on Solana (devnet by default, localnet and mainnet also supported):
- `@solana/kit` for type-safe RPC interactions (`createSolanaRpc`)
- `@solana/wallet-adapter-react` for wallet connection (Phantom, Solflare, Backpack via Wallet Standard auto-registration)
- `@ar.io/sdk` provides `SolanaARIOReadable` and `SolanaARIOWriteable` for ar.io network interactions on Solana
- Four Solana program IDs configured via env vars: `VITE_ARIO_CORE_PROGRAM_ID`, `VITE_ARIO_GAR_PROGRAM_ID`, `VITE_ARIO_ARNS_PROGRAM_ID`, `VITE_ARIO_ANT_PROGRAM_ID`
- RPC endpoint set via `VITE_SOLANA_RPC_URL` (see `.env.local` for devnet, `.env.localnet` for localnet)
- `WalletBridge` (`/src/components/WalletBridge.tsx`) bridges the Solana wallet adapter to the ar.io SDK's signer interface
- `walletAdapterBridge.ts` (`/src/utils/walletAdapterBridge.ts`) converts wallet-adapter signers to `@solana/kit`-compatible signers

### State Management

- **Zustand** for global state:
  - `useGlobalState` (`/src/store/globalState.ts`) - wallet info, SDK instances (`arIOReadSDK`, `arIOWriteableSDK`), Solana RPC instance, current epoch, Solana slot, theme
  - `useSettings` (`/src/store/settings.ts`) - user-configurable settings (Solana RPC URL, program IDs, Arweave GQL URL, sidebar state); persisted to localStorage with smart merge to prevent stale localhost URLs
  - `useColumnPreferences` (`/src/store/columnPreferences.ts`) - table column visibility
- **React Query** for server state; custom `queryKeyHashFn` handles non-serializable Solana `Connection` objects in query keys
- **IndexedDB** (via Dexie) for persistent caching of observations and epochs (`/src/store/db.ts`); database name derived from network tier (solana-devnet, solana-localnet, solana-mainnet)

### Data Fetching Pattern

Custom hooks in `/src/hooks/` follow this pattern:

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

### App Initialization

`GlobalDataProvider` handles app-wide data initialization:
- Fetches current epoch and ticker on load
- Updates Solana slot periodically
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
- `/src/services/` - External service integrations (Sentry)
- `/src/store/` - Zustand state management
- `/src/utils/` - Helper functions (includes `walletAdapterBridge.ts` for Solana signer conversion)
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
- Tailwind CSS with custom design tokens in `/tokens/`, Rubik font, dark mode via `selector` strategy
