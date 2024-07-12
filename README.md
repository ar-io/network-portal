# network-portal

A React web application for interacting with the ar.io network.

## Getting Started

### Run

```shell
yarn
yarn dev
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

The application release process deploys the application to the network-portal.app domain as well as to Arweave using [permaweb-deploy](https://github.com/permaweb/permaweb-deploy). Developers can deploy their own versions of the application to arweave using `yarn deploy`.

Running `yarn deploy` uses the following environment variables:

```
export VITE_IO_PROCESS_ID=[process ID for IO process]
export DEPLOY_ANT_PROCESS_ID=[process id of the ant process to deploy to]
export DEPLOY_KEY=[base64 encoded version of wallet keyfile]
```

For local testing, you can create a deploy.sh script with the above values defined, run `source deploy.sh`, then use `yarn deploy`. 
