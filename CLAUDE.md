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
yarn build         # Full tsc --build type check, then Vite production build (memory-heavy: NODE_OPTIONS max-old-space-size=32768)
yarn deploy        # Build, then deploy to Arweave via @ar.io/deploy (ario-deploy); requires VITE_ARNS_NAME + DEPLOY_KEY (base64 wallet keyfile) env vars
```

## Code Conventions

- **Formatting**: Biome with single quotes, 2-space indent
- **Commits**: Conventional Commits enforced via commitlint (`feat:`, `fix:`, `chore:`, etc.)
- **Pre-commit**: Husky runs lint-staged which auto-fixes with Biome on `*.{ts,tsx,js,md,json}`
- **Path aliases**: Use `@src/*` for `./src/*` and `@tests/*` for `./tests/*` (configured in both tsconfig.json and vite.config.ts)
- **SVGs**: Import as React components via vite-plugin-svgr; icon components live in `/src/components/icons/` (only barrel export in the project)
- **Stale configs**: `.eslintrc`, `.prettierrc` and `jest.config.json` are all leftovers. Biome and Vitest are authoritative — don't add rules to the dead files

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

  `useSettings` is **versioned** (`SETTINGS_VERSION` + `migrateSettings`). Its `merge`
  lets persisted values win over the build's defaults, so a stored RPC endpoint
  otherwise outlives the release that replaced it — when a provider token was rotated,
  every returning user kept calling the revoked one and got 401 while new visitors were
  fine. **Bump `SETTINGS_VERSION` whenever a shipped default must reach existing users.**
- **React Query** for server state; custom `queryKeyHashFn` handles non-serializable Solana `Connection` objects in query keys
- **IndexedDB** (via Dexie) for persistent caching of observations and epochs (`/src/store/db.ts`); database name derived from network tier (solana-devnet, solana-localnet, solana-mainnet)

### Portal Snapshot API

`getGateways`/`getVaults`/`getBalances`/`getAllDelegates` are whole-program
scans, and running them per browser made RPC cost scale with traffic. When
`VITE_PORTAL_API_URL` is set, the canonical queries read published static JSON
instead (`/src/utils/portalApi.ts`), served by `ar-io-network-analyzer`.

The fallback is not optional. Any failure — unset, unreachable, malformed,
stale beyond 30 minutes, stamped with a different network, or derived from
different Solana programs — returns null and the hook runs the live scan. The
production build is published immutably to Arweave, so a hard dependency on a
host that lapses would brick a permanent deploy.

Hooks reading the snapshot:

| Hook | Document | Filter |
|---|---|---|
| `useGatewaysQuery` | `gateways.json` | — |
| `useVaultsQuery` | `vaults.json` | — |
| `useAllBalances` | `balances.json` | — |
| `useAllDelegates` | `delegates.json` | — |
| `usePrimaryName` | `primaryNames.json` | `owner` |
| `useArNSStats` | `summary.json` | `counts.arnsRecords` |

Two of those are worth their own note:

- `useArNSStats` only ever wanted a count, but `getArNSRecords({ limit: 1 })`
  scans the whole ArNS program and deserializes every record before truncating
  **in memory** — so one number cost a full registry sweep per visitor.
- `getPrimaryName(address)` is an **unfiltered** whole-program scan that
  filters client-side, so resolving one wallet's name swept the entire set.

`withdrawals.json` is GAR `Withdrawal` accounts and is **not** `vaults.json`,
which is core-program `Vault` accounts — different datasets, not two views.

**A snapshot is only worth it for an unfiltered whole-program scan.** The test
before moving any read: is the RPC call server-side filtered, and is the value
freshness-sensitive? If either is yes, leave it on RPC.

`useGatewayDelegates` and `useGatewayVaults` were briefly served from the
snapshot and reverted. `getGatewayDelegates`/`getGatewayVaults` are
memcmp-filtered on the gateway pubkey at offset 8, so the node returns only
that gateway's rows — averaging under one row per gateway across the network.
Answering them from the published documents meant downloading every other
gateway's data (~154KB and ~142KB) to filter client-side. Both keys are also
invalidated after a write, where a snapshot lagging by a publish interval
renders the pre-write state.

`useDelegateStakes` stays on RPC for a different, harder reason:
`getDelegations` unions `type: 'stake'` rows from DELEGATION accounts with
`type: 'vault'` rows from WITHDRAWAL accounts, both keyed by delegator.
`delegates.json` covers only the stake half and carries no `type`, and
`withdrawals.json` cannot supply the other half because both public SDK
projections drop the withdrawal's `owner`. Serving half a wallet's position is
worse than spending the call.

**Observations and epochs are not published at all.** `useObservations` reads
them straight from the GAR program, and `Observation` PDAs are deleted by the
permissionless `close_observation` once an epoch distributes — so that history
is unrecoverable from RPC after the fact and survives only in whichever
browser's IndexedDB happened to cache it. `Epoch.observationsSubmitted` keeps
the count but not the content.

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

- Hash-based routing (`createHashRouter`) with React Router v6
- All route components lazy-loaded with `React.lazy()` except Dashboard
- Routes: `/dashboard`, `/gateways`, `/gateways/:ownerId`, `/gateways/:ownerId/reports`, `/gateways/:ownerId/reports/:reportId`, `/gateways/:ownerId/observe`, `/staking`, `/observers`, `/balances`, `/balances/:walletAddress`, `/extensions`

### Token Units

The SDK returns balances and stakes in **mARIO**; the UI shows **ARIO**. Convert at
the boundary rather than mid-calculation, and never mix the two in one expression:

```typescript
new mARIOToken(gateway.operatorStake).toARIO().valueOf()  // reading -> display
new ARIOToken(amountToStake).toMARIO()                    // form input -> SDK write
```

### Writing Transactions

Write flows follow a fixed shape (see `/src/components/modals/ReviewStakeModal.tsx`):
a review modal collects input, `BlockingMessageModal` covers the wallet round-trip,
the call goes through `arIOWriteableSDK` with `WRITE_OPTIONS`, every affected React
Query key is invalidated by hand, then `SuccessModal` shows the tx id. Failures go to
`showErrorToast`. `arIOWriteableSDK` is undefined until a wallet with signing
capability connects, so guard on it before starting a flow.

### SDK Import Paths

`@ar.io/sdk/web` for the app-level API (`ARIO`, `ARIORead`, `mARIOToken`,
`GatewayWithAddress`); `@ar.io/sdk/solana` for on-chain primitives (PDA helpers,
deserializers, program ids). Never import from bare `@ar.io/sdk`.

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
- `/src/store/` - Zustand state management
- `/src/utils/` - Helper functions (includes `walletAdapterBridge.ts` for Solana signer conversion)
- `/tokens/` - Design token definitions (primitives.json consumed by Tailwind config)
- `/tests/` - Test files (some also co-located in `/src/`)

### Testing

- Vitest with globals enabled (no need to import `describe`, `it`, `expect`, etc.)
- `vitest.config.ts` extends the base Vite config with `test: { globals: true }`
- Legacy `jest.config.json` exists but is unused; tests run via vitest only

### Environment & Secrets

RPC endpoints come from the environment and are **never committed** — `.env*` is
gitignored, `.env.example` documents the shape. A provider URL carries an auth token
in its path, so treat it as sensitive in source, but note that Vite inlines it into the
bundle: it is published to every visitor regardless, and permanently so via Arweave.
The endpoint is protected at the provider (referrer allowlist, per-method rate limits),
not by keeping the token out of git.

Both deploy workflows pass `VITE_SOLANA_RPC_URL` and `VITE_SOLANA_MAINNET_RPC_URL` from
repository secrets. Production has a `verify-secrets` gate that fails the run when either
is empty — unset would otherwise silently fall back to public RPC and ship a degraded,
permanent build that looks healthy in CI.

### Development Notes

- Node.js 24.16.0 required (see `.nvmrc`); workflows read `node-version-file: .nvmrc`
- Environment variables use `VITE_` prefix
- Sourcemaps are deliberately not emitted — they were ~13MB per deploy, stored
  permanently on Arweave, and only existed to symbolicate Sentry traces
- Pre-commit hooks run Biome via Husky
- CI/CD: `develop` -> GitHub Pages (staging); `main` -> Firebase + Arweave (production, permanent). PRs publish an Arweave preview
- Tailwind CSS with custom design tokens in `/tokens/`, Rubik font, dark mode via `selector` strategy
