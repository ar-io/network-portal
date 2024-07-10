# network-portal
Application for interacting with the ar.io network.

## Deployment

Running `yarn deploy` uses the following environment variables:

```
export VITE_IO_PROCESS_ID=[process ID for IO process]
export DEPLOY_ANT_PROCESS_ID=[process id of the ant process to deploy to]
export DEPLOY_KEY=[base64 encoded version of wallet keyfile]
```

For local testing, you can create a deploy.sh script with the above valeus defined, run `source deploy.sh`, then use `yarn deploy`. 
