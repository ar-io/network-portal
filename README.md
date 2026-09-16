# network-portal

A React web application for interacting with the ar.io network.

## Getting Started

### Run

```shell
yarn
cp .env.example .env.local   # then fill in a Solana RPC endpoint
yarn dev
```

`yarn dev` reads `.env.local` and targets Solana devnet. `.env*` is gitignored
(RPC URLs carry provider auth tokens), so a fresh clone has no `.env.local` —
copy `.env.example`, which documents every variable and which ones are optional.

For localnet, put the same settings in `.env.localnet` and run:

```shell
yarn dev:localnet
```

### Build

```shell
yarn build
```

### Test

```shell
yarn test
```

## Deployment

Pushing to `main` deploys the application to the network-portal.app domain via
Firebase Hosting and, permanently, to Arweave via the
[ar-io-deploy](https://github.com/ar-io/ar-io-deploy) action. Pushing to
`develop` deploys staging to GitHub Pages. A pull request gets an Arweave
preview only when it changes files under `content/` or `src/`, so a
documentation-only change does not get one.

Developers can deploy their own version to Arweave with `yarn deploy`, which
builds and then runs `ario-deploy` from
[@ar.io/deploy](https://github.com/ar-io/ar-io-deploy). It needs two environment
variables:

```shell
export VITE_ARNS_NAME="ARNS_NAME"
export DEPLOY_KEY="BASE64_ENCODED_ARWEAVE_WALLET_KEYFILE"
```

Replace the following:

- `ARNS_NAME` with the ArNS name to deploy to.
- `BASE64_ENCODED_ARWEAVE_WALLET_KEYFILE` with your Arweave wallet keyfile,
  base64 encoded.

Keep these out of git along with the rest of your `.env` files. For local
testing you can put them in a `deploy.sh`, `source deploy.sh`, then run
`yarn deploy`.

## Resources

- [ar.io](https://ar.io)
- [ar.io Whitepaper](https://whitepaper_ar-io.arweave.net/)
- [ar.io SDK](https://github.com/ar-io/ar-io-sdk)
- [arweave](https://arweave.org)
- [ao](https://ao.arweave.net/)
