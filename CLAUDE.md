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
yarn lint:check    # Check for linting issues (biome check --unsafe)
yarn lint:fix      # Fix linting and formatting issues automatically (--unsafe)
yarn format:check  # Check formatting only
yarn format:fix    # Fix formatting only
yarn tsc --noEmit  # Type check the whole project, tests included (see note below)
yarn vis           # Visualize bundle composition (vite-bundle-visualizer)

# Build and deploy
yarn build         # rimraf dist, then tsc --build tsconfig.build.json, then Vite production build (memory-heavy: NODE_OPTIONS max-old-space-size=32768)
yarn deploy        # Build, then deploy to Arweave via @ar.io/deploy (ario-deploy); requires VITE_ARNS_NAME + DEPLOY_KEY (base64 wallet keyfile) env vars
```

**A green build does not type check the tests.** `yarn build` uses
`tsconfig.build.json`, which drops `tests` from `include` and excludes
`**/*.test.ts(x)`; CI runs `build` but never `tsc --noEmit`. Run
`yarn tsc --noEmit` (root config) yourself before pushing a change that touches
test files.

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

### Solana RPC Client

The kit RPC client is **not** the SDK's `createCircuitBreakerRpc`.
`/src/utils/solanaRpc.ts` builds it with `createThrottledRpc`, and `getSolanaRpc(url)`
in `globalState.ts` memoises one instance per endpoint — the rate gate lives *inside*
the client, so a single instance is what keeps the whole tab under one budget. Never
construct a second one ad hoc.

Each piece exists because the SDK's breaker measurably failed at it:

- **A token bucket with AIMD** — 10 req/s ceiling, halved on every 429, recovered by
  +1 after 20 consecutive successes, floored at 1. A 429 always slows down: an
  advertised `x-ratelimit-rps-limit` may only *lower* the rate further (× 0.9), never
  hold it up, because the SDK's `min(ceiling, advertised * 0.9)` resolved straight back
  to the ceiling whenever a provider advertised a high limit — and public mainnet-beta
  advertises 250. `Retry-After` is honoured; a 429 without one pauses 1s.
- **No fallback by default.** `VITE_SOLANA_FALLBACK_RPC_URL` is opt-in and shares the
  same gate, so failing over can never multiply load. The SDK's `defaultFallbackUrl()`
  resolved to a public endpoint and sent it 100% of the app's traffic — whole-program
  scans included — for the full 60s reset window, at a flat 10 req/s that its throttle
  could not even see. Failover engages after 5 consecutive primary failures and
  re-probes the primary after 30s.
- **A 30s per-request timeout**, deliberately generous: a whole-program scan
  legitimately takes seconds, and the SDK's 10s opossum timeout counted those as
  failures, which is one of the ways the circuit tripped under normal load.

With no fallback configured, a dead endpoint surfaces an error and the user switches
endpoints in Settings — strictly better than silently flooding a public good.

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
- **IndexedDB** (via Dexie) for persistent caching of observations, epochs and dashboard
  counts (`/src/store/db.ts`). The database is named for the **network tier**, deliberately
  not for the endpoint: these are facts about the network, not about whichever provider was
  asked, so switching providers within a tier reuses the cache instead of re-running three
  program scans.

Network tier is inferred from the RPC URL string (`localhost`/`127.0.0.1` -> localnet, then
`devnet`/`testnet`, else mainnet) in both `settings.ts` and `globalState.ts`, and it drives
the default program IDs, the IndexedDB name (`solana-devnet`, `solana-localnet`,
`solana-mainnet`), and which portal API preset applies. Program-id overrides are stored per
tier (`solanaAddressSettingsByNetwork`) so switching networks does not carry the other
network's addresses across. Changing the RPC URL in Settings rebuilds the RPC client, the
read SDK and the database handle, and clears `arIOWriteableSDK` — `globalState` subscribes
to `useSettings` for exactly that.

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
| `useNetworkStats` | `summary.json` + `delegates.json` | per count, see below |

Two of those are worth their own note:

- `useArNSStats` only ever wanted a count, but `getArNSRecords({ limit: 1 })`
  scans the whole ArNS program and deserializes every record before truncating
  **in memory** — so one number cost a full registry sweep per visitor.
- `getPrimaryName(address)` is an **unfiltered** whole-program scan that
  filters client-side, so resolving one wallet's name swept the entire set.

`withdrawals.json` is GAR `Withdrawal` accounts and is **not** `vaults.json`,
which is core-program `Vault` accounts — different datasets, not two views.

`useNetworkStats` is the one hook that reads each value from its own source. Its
three dashboard counts are whole-program scans, so they come from the snapshot:
addresses and vaults as scalars in `summary.json`, delegates by deduping
`delegates.json` on address, because `counts.delegates` counts delegation *rows*
(542 on devnet) where the panel shows unique delegating *addresses* (352). The two
documents must share a `generatedAt` — the publisher stamps a whole cycle alike —
and a mismatch is retried once, then read live, rather than mixing two cycles in one
panel. After a write, only the counts that write could have moved are read live;
a vaulted transfer re-reads vaults, never balances.

**A write makes the snapshot wrong, and invalidating does not fix it.** The
refetch downloads the same document the publisher generated before the write, so
the user who just signed is the one person guaranteed to see stale data. After a
write, `@src/utils/snapshotFreshness` makes that document read from chain for a
bounded window instead.

There is no sound way to ask a document whether it contains a write: it carries
`generatedAt`, which is when the publisher *uploaded* the file, not when it read
the chain, and comparing against the browser's clock fails on any machine whose
clock is off. So the window is a duration measured entirely on the client, long
enough to outlast `MAX_SNAPSHOT_AGE_MS` plus scan-to-publish latency. A failed
live read propagates rather than falling back — React Query would otherwise
cache the pre-write document as a success for the query's `staleTime`, which is
an hour for gateways and vaults.

**Every write flow must pair invalidation with marking**, and
`invalidateWrittenDocuments(queryClient, ...names)` does both in one call — the
query key and the document name are the same string, so they cannot drift. A query
*derived* from a document rather than named for it goes in `DERIVED_QUERY_KEYS`
(`snapshotFreshness.ts`); `networkStats` is there, because otherwise it served the
pre-write counts for the rest of its hour. Mark
only the documents the transaction actually changes: a stake decrease moves
tokens into a withdrawal account and does not touch `balances`, and `balances`
is the most expensive scan on the network. Hand-placing the two separately does
not survive: `gateways` was once invalidated in seven flows and marked in none.

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

**The analyzer serves two separate APIs — check both before concluding
something is unpublished.** `/api/v1/portal/` holds the current-state documents
this app reads; `/api/v1/` is the archive, with its own manifest at
`/api/v1/index.json` (`documents`: epochs, findings, gateways, network,
observers, plus an `archive` array of dated snapshots). `/api/v1/portal/index.json`
describes only the portal half, so reading it alone will make the archive look
absent.

Historical observations live there, at `/api/v1/epochs/<index>.json` — each
carrying `observations[]` with `observer`, `pubkey`, `reportTxId`,
`submittedAt` and `gatewayResultsBase64`. They survive because capture writes
them to SQLite before the accounts are swept.

That matters because RPC genuinely cannot serve them after the fact:
`Observation` PDAs are deleted by the permissionless `close_observation` once
an epoch distributes, and `Epoch.observationsSubmitted` keeps the count but not
the content. `useObservations` still reads live epochs straight from the GAR
program; for a closed epoch the archive is the only source.

The endpoint is user-configurable in Settings (`portalApiUrl`), seeded from
`VITE_PORTAL_API_URL`, with presets for the two published hosts. Unset still
means the snapshot reads start off, so removing the variable is a real
rollback. The network switcher moves the endpoint along with the RPC URL, but
only when one is in use.

### Analyzer Archive API

`/src/utils/analyzerApi.ts` reads the `/api/v1/` half, and is deliberately a
separate client from `portalApi.ts` rather than another `PortalDocumentName`:

- **No `network` or `programIds` stamp**, so the portal client's mismatch guard
  has nothing to check.
- **Cadence varies per document.** The portal republishes every ~10 minutes;
  `network.json` and the gateway roster are rebuilt **daily**. Applying the
  portal's single 30-minute window to them would reject every one, silently and
  forever — so freshness is per document, and epoch documents have no window at
  all because history does not go stale.
- **`/api/v1/gateways.json` is not `/api/v1/portal/gateways.json`.** The first
  is ~316 analysed rows with DNS/ASN/cluster detail; the second is every
  gateway on chain. Same filename, different dataset.

Everything read from it is additive: unavailable means render without the
panel, never an error.

**The analysis layer is mainnet-only.** Devnet publishes the portal documents
and nothing else, so these panels correctly disappear there and
`useObservations` falls back to the live read.

Two contract traps the publisher documents and the UI honours: `economics` is
always null, and `infrastructure` is zeroed when a run skips geolocation —
`uniqueAsns: 0` is a degraded run, not a decentralised network.

**Results bitmaps: count, never attribute.** An observation's
`gatewayResultsBase64` (`gar-bitmap-v1-lsb`) indexes into the gateway
registry's slot order *for that epoch*, and the archive publishes only a digest
of that ordering. A population count is therefore exact — `countGatewayResults`
— while naming *which* gateway failed would mean indexing historical bits
against today's registry. `ObservationData.hasGatewayAttribution` exists so
consumers branch on it: an empty `failureSummaries` must never render as "no
failures", which previously would have shown a green **Passed** for a gateway
whose result is simply unknown.

### Arweave Data Layer (Reports)

Observation reports are gzipped JSON on Arweave — a fourth data source alongside
RPC, the portal snapshot and the analyzer archive. `useReport` downloads one by
transaction id and reads it either way a gateway serves it: with
`Content-Encoding: gzip` the browser has already decompressed the body, so JSON
arrives as-is; without the header the gzip bytes arrive untouched and `fflate`
decompresses them. Anything that is neither gzip nor JSON is rejected rather than
saved as a `.json` file, which is what a gateway's HTML error page used to become.
`useReports` lists them, resolving
at most `EPOCH_CONCURRENCY` (4) epochs at a time so a long epoch selector neither
stacks into a visible wait nor arrives as a burst against one endpoint.

**Which gateway serves the data depends on where the app is served from.**
`arweaveUrl.ts` probes `/ar-io/info` once at load (`GlobalDataProvider`), caches
the answer for the session and defaults to false. When the app is itself served
from an ar.io gateway, `arweaveTxUrl` returns a relative `/<txid>` so that
gateway fetches the data; otherwise it falls back to the configured host.
`getReferenceGatewayFqdn()` deliberately ignores the serving hostname — the app
may be reached at an ArNS subdomain, and stacking another name on top of that
(`arns-name.portal.example.com`) does not resolve.

Report **metadata** comes from an Arweave GraphQL indexer (`arweaveGqlUrl` in
Settings, goldsky by default) via a **hand-written query, and it must stay that
way.** `arweave-graphql`'s generated `getTransactions` declares
`$block: BlockFilter`, a type the configured endpoint's schema does not define —
it has `RangeFilter` — so every call failed validation before reaching the data,
which is why the reports table's Generated At, Size and Version were never
populated. Asking only for the fields the table renders sidesteps the mismatch
and keeps the query independent of whichever indexer a user points at.

### Extensions

`/extensions` is the one route backed by neither chain, snapshot nor archive.
`fetchExtensionsData()` derives an ArNS URL from the *current* hostname —
swapping `extensions_gateways` into the first subdomain, or using
`extensions_gateways.ar.io` on localhost, `network-portal.app` and Firebase
preview hosts — then falls back to the bundled `/data/extensions.json` when that
fetch fails.

Everything passes through `validateExtensionsData`, which drops unknown
categories and tags and rejects any URL that is not `http(s)`. This is untrusted
third-party JSON rendered as links, so the validation is the feature, not
boilerplate.

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

The `QueryClient` defaults (App.tsx) already set `staleTime: 5 * 60 * 1000`,
`refetchOnWindowFocus: false` and `refetchOnReconnect: false` — restate them in a hook only
to differ.

**`retry: 0` is a default not to override.** The SDK wraps every read in `withRetry`
(3 attempts, exponential backoff with jitter, transient transport errors only). React
Query's default of 3 sits on top and multiplies to 12 attempts per failing query — each
potentially a whole-program scan — which is how a brief 429 becomes a sustained one. It also
retries what the SDK deliberately does not (account-not-found, deserialization failures),
where a re-run can never succeed.

**Prefer a targeted account read over a convenience SDK method.** `fetchEpochLightweight`
(`/src/utils/epochFetch.ts`) reads the Epoch PDA in one call where `getEpoch()` makes ~55
(per-gateway weights, name resolution, observations) — the same reasoning that makes
`ARIO_TICKER` a constant instead of a two-account `getInfo()` round trip. It returns
`EpochDataWithCounters`, whose `observationsSubmitted` / `rewardsDistributed` live on the
Epoch account and are the only durable record of participation once observation PDAs are
closed. Both are optional and the SDK fallback path omits them: treat absent as unknown,
never as zero.

When two callers need the same account, route both through `queryClient.fetchQuery` on the
shared key rather than fetching directly — `GlobalDataProvider` does this with
`epochSettingsQueryKey`, and reading it directly is what made EpochSettings a
three-times-per-load fetch.

### App Initialization

`GlobalDataProvider` handles app-wide data initialization:
- Fetches current epoch and ticker on load
- Covers the window before that epoch is prescribed (see **Epoch Rewards**)
- Updates Solana slot periodically
- Cleans up stale IndexedDB cache

### Epoch Rewards

**Read `per_gateway_reward` from the Epoch account; never derive it.** Every yield
in the app divides it, and it cannot be reconstructed from anything a browser can
see: the protocol computes `total_eligible_rewards * gateway_reward_ratio /
RATE_SCALE / joined_count`, where `joined_count` (registry slots with a positive
composite weight after tally) is never stored, `reward_rate` decays between 0.1%
and 0.05% per epoch, and `gateway_reward_ratio` is governance-set — mainnet runs
80/20 against a program default of 90/10. The app once hardcoded 0.0005 and 0.9 and
counted gateways itself, two different ways; the staking table and modal disagreed
by 25% and both overstated. `usePerGatewayReward()` is the only way to read it.

`epoch.active_gateway_count` is **not** the divisor. It bounds the distribution
traversal and counts every registry slot, leavers included (620 against 306
eligible on mainnet). Multiplying by it overstated the rewards chart about 2x.

**An epoch has a window with no split.** `create_epoch` sets
`total_eligible_rewards` immediately but leaves both per-unit rewards at zero until
`prescribe_epoch` runs. `rewardsPrescribed: false` marks that state, and it renders
as *pending*, never as a split of zero or of everything — the remainder formula
alone would credit 100% of the pool to gateways. While the newest epoch is
unprescribed, `referencePerGatewayReward` (the previous epoch's figure) stands in for
yields and `GlobalDataProvider` re-reads the epoch until it is prescribed.

**Cached epochs are versioned, not migrated.** IndexedDB keeps distributed epochs
across releases, so a row can outlive the formula that wrote it. `getEpoch` passes
every cached row through `upgradeCachedEpoch`, which recomputes `distributions` from
the row's own fields and writes it back. **Bump `REWARD_TOTALS_VERSION` whenever the
meaning of `distributions` changes, and teach `upgradeCachedEpoch` the old shape.**
Deliberately not a Dexie schema bump: clearing the table would throw away rows that
may be the only copy once an epoch account is closed, and Dexie refuses to open a
database older than the one on disk, so reverting past a schema bump silently turns
caching off for everyone who loaded the newer build.

**Yield has four states, and `useYieldStatus` names them**: `loading` (placeholder,
no message), `pending` (read but unprescribed, no stand-in), `failed` (the epoch read
failed), `available`. Collapsing the first and third is how a table once told users
the epoch "could not be read" during every normal page load. An unknown yield is
`undefined`, never a negative sentinel — `knownYield` converts, `YieldCell` renders,
and EAY columns set `sortUndefined: 'last'` so unknowns never lead an ascending sort.

**`currentEpoch` is undefined both while loading and after a failure;**
`epochLoadFailed` tells them apart. A query gated on `currentEpoch` is *disabled*,
not failed, when the epoch never arrives — it stays pending forever and its
`isError` never fires — so panels downstream of the epoch branch on
`epochLoadFailed`, not on their own query's error. A failed read renders
`PanelUnavailable` or reads "Unavailable"; a skeleton promises arrival and must not
be left shimmering for a read that has failed.

Two splits the protocol makes that the yields follow: the delegate pool is carved
out only when the gateway had delegated stake at tally (`split_scaled_reward`), so a
gateway with delegation on and no delegators pays its operator everything; and the
observer reward is excluded from both yields, which the EAY tooltip states.

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

**Timestamps cross a units boundary in the same way.** The programs store unix
**seconds**; the SDK's read methods convert with `secToMs`, so everything reaching
the app — `getVaults`, the portal snapshot documents — is in **milliseconds** and
`new Date(value)` is correct. Raw `deserializeVault` does **not** convert, so a
value taken straight off an account is in seconds and renders as 1970. Writes go
the other way: `vaultedTransfer` takes `lockLengthMs` and floors it to seconds
itself.

### Writing Transactions

Write flows follow a fixed shape (see `/src/components/modals/ReviewStakeModal.tsx`):
a review modal collects input, `BlockingMessageModal` covers the wallet round-trip,
the call goes through `arIOWriteableSDK` with `WRITE_OPTIONS`, every affected React
Query key is invalidated by hand, then `SuccessModal` shows the tx id. Failures go to
`showErrorToast`. `arIOWriteableSDK` is undefined until a wallet with signing
capability connects, so guard on it before starting a flow.

### Locked Transfers (Vaults)

`vaultedTransfer` sends tokens into a vault the recipient cannot touch until it
unlocks. `TransferArioModal` collects it behind a toggle and
`ReviewLockedTransferModal` commits it. Four things about it are not obvious:

- **It stores a duration, not a date.** The program computes
  `end_timestamp = clock.unix_timestamp + duration` when the transaction *lands*,
  so the vault unlocks that long after confirmation, not at an instant the user
  chose. `@src/utils/vaultLock` therefore works in whole days and the UI says "on
  or around". Do not add a time-of-day input on top of this — it would promise a
  precision the protocol cannot keep.
- **The SDK parameter is `revokable`; the on-chain field is `revocable`.**
  Misspelling it silently sends a non-revocable vault, which nobody can undo.
- **The vault address depends on the recipient's vault counter, read before
  signing.** Another vault created for that recipient in the meantime makes the
  derived address stale and the transaction fails — a hardware wallet's slower
  confirmation widens the window. `@src/utils/vaultErrors` maps that to a retry
  message rather than raw Anchor text.
- **No SDK estimator covers it.** `getGasEstimate` takes an ArNS `Intent` and
  `getGarGasEstimate` a `GarGasWorkflow`; a core-program vault is neither, so
  `useVaultGasEstimate` composes `estimateRentLamports` + `estimateGasFee`
  directly. Rent dominates — a vault deposits for a Vault PDA (110 bytes) and the
  vault's own token account, roughly two orders of magnitude more SOL than the
  plain transfer beside it.

Protocol limits worth knowing before changing the form: a vault must hold at least
**100 ARIO** (`VaultBelowMinimum`, 6014), a locked transfer to yourself is rejected
(`SelfTransfer`, 6003), and the lock bounds the portal enforces (14 days to ~12
years) are the SDK's, not readable from chain.

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
- **`vitest.config.ts` does not extend `vite.config.ts` — it duplicates it.** Plugins,
  aliases, `base`, `esbuild: false` and the build options are copy-pasted, so a plugin or
  path alias added to one silently never reaches the other. The `define` blocks have
  already drifted: the Vite config imports `packageJson.version` and defines
  `process.version`; the Vitest one reads `process.env.npm_package_version` and defines
  neither. Change both.
- Tests live in `/tests/` mirroring `src` (`tests/utils/`, `tests/hooks/`, `tests/store/`,
  `tests/components/`). `src/utils/extensionsLoader.test.ts` is the one exception
- Legacy `jest.config.json` exists but is unused; tests run via vitest only

### Environment & Secrets

RPC endpoints come from the environment and are **never committed** — `.env*` is
gitignored, `.env.example` documents the shape. A provider URL carries an auth token
in its path, so treat it as sensitive in source, but note that Vite inlines it into the
bundle: it is published to every visitor regardless, and permanently so via Arweave.
The endpoint is protected at the provider (referrer allowlist, per-method rate limits),
not by keeping the token out of git.

Both deploy workflows pass `VITE_SOLANA_RPC_URL` and `VITE_SOLANA_MAINNET_RPC_URL` from
repository secrets. Production has a `verify-secrets` gate, and ships a permanent build,
so it must not be weakened.

**`VITE_SOLANA_RPC_URL` is the devnet slot, despite the generic name.** The gate checks
shape as well as presence, because non-empty was not enough: during an endpoint rotation
the mainnet URL went into both slots, the build stayed green, and the app worked — but
Settings infers the tier from the URL text, read "mainnet" from both, and "Switch to
Devnet" silently reloaded mainnet. The gate now also fails when the two resolve to the
same endpoint (ignoring a trailing slash, which is what hid it), when the devnet slot's
URL does not say `devnet`, or when the mainnet slot's does. Those assert exactly what
`getNetworkTierFromRpcUrl` will infer at runtime: an endpoint whose URL does not name its
network cannot drive the switcher. Staging has no such gate, so it can still ship the
mix-up.

**The public fallbacks are not a safety net, and the mainnet one is not usable at
all.** `api.mainnet-beta.solana.com` answers `403 Access forbidden` to any request
carrying an `Origin` header — which every browser request has. The identical call
returns 200 from curl, which sends none, so this is easy to "verify" wrongly from a
terminal. An unset mainnet secret therefore does not degrade the app so much as
hollow it out: the shell renders and snapshot-backed views still populate, while
every RPC-backed read fails — starting with the current epoch and everything gated
behind it — so it reads as a permanently loading page rather than an error.
`api.devnet.solana.com` does answer browsers, rate-limited.

The portal snapshot API is a separate variable, `VITE_PORTAL_API_URL`, and is
deliberately **outside** that gate: empty is a supported state that falls back to
direct RPC, and removing the variable is the documented rollback.

Three more variables are opt-in with no usable default:

- `VITE_SOLANA_FALLBACK_RPC_URL` — a second endpoint to fail over to. It once defaulted to
  the public Solana RPC; only point it at an endpoint you are entitled to saturate (see
  **Solana RPC Client**).
- `VITE_PORTAL_MAINNET_API_URL` / `VITE_PORTAL_DEVNET_API_URL` — presets offered in Settings
  for flipping between published hosts. They fall back to the public hosts when unset and
  apply only on an explicit choice, so an empty `VITE_PORTAL_API_URL` still ships with the
  snapshot reads off.

### Development Notes

- Node.js 24.16.0 required (see `.nvmrc`); workflows read `node-version-file: .nvmrc`
- Environment variables use `VITE_` prefix
- Sourcemaps are deliberately not emitted — they were ~13MB per deploy, stored
  permanently on Arweave, and only existed to symbolicate Sentry traces
- Pre-commit hooks run Biome via Husky
- CI/CD: `develop` -> GitHub Pages (staging); `main` -> Firebase + Arweave (production, permanent).
  `build_and_test.yml` runs on push to `develop`, not on pull requests, so nothing
  type-checks, lints, tests or builds a PR before merge — run them yourself. The
  PR preview workflow (`pr-preview.yml`) exists but is disabled in the repository,
  so PRs get no Arweave preview.
- Tailwind CSS with custom design tokens in `/tokens/`, Rubik font, dark mode via `selector` strategy
