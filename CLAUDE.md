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

- **Zustand** for global state (see `/src/store/index.ts`)
- Key global state includes: wallet info, SDK instances, current epoch, block height
- **React Query** for server state with 5-minute default cache time
- **IndexedDB** (via Dexie) for persistent caching of observations and epochs

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

### Multi-Wallet Architecture

- Supports ArConnect (Arweave), MetaMask (Ethereum), and Beacon wallets
- Wallet logic abstracted in `/src/services/wallets/`
- Unified through `WalletProvider` context

### Routing

- Hash-based routing with React Router v6
- Lazy-loaded route components
- Main routes: `/dashboard`, `/gateways`, `/staking`, `/observers`, `/balances`

### Key Domain Concepts

- **Gateways**: Network nodes that serve data, can be staked to
- **Staking**: ARIO token staking/delegation to gateways
- **Observers**: Monitor gateway performance and generate reports
- **Epochs**: Time periods for rewards and assessments
- **Vaults**: Token locking for withdrawals

### Important Directories

- `/src/components/` - Reusable UI components
- `/src/hooks/` - Data fetching and business logic hooks
- `/src/pages/` - Route page components
- `/src/services/` - External service integrations
- `/src/store/` - Zustand state management
- `/src/utils/` - Helper functions

### Development Notes

- Node.js 20.12.2 required (see `.nvmrc`)
- Environment variables use `VITE_` prefix
- Pre-commit hooks run Biome via Husky
- CI/CD deploys to GitHub Pages (staging) and Arweave (production)
- Uses Tailwind CSS with custom design tokens in `/tokens/`
