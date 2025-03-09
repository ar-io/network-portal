import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: false,
  build: {
    sourcemap: true,
    minify: true,
    cssMinify: true,
  },
  plugins: [
    svgr(),
    react(),
    nodePolyfills(),
    ...(process.env.VITE_NODE_ENV
      ? [
          sentryVitePlugin({
            org: process.env.VITE_SENTRY_ORG,
            project: process.env.VITE_SENTRY_PROJECT,
            ignore: ['node_modules', 'vite.config.ts'],
            authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
            sourcemaps: {
              assets: './dist/**',
            },
            release: process.env.VITE_SENTRY_RELEASE,
            deploy: {
              env: process.env.VITE_NODE_ENV,
            },
          }),
        ]
      : []),
  ],
  base: '',
  define: {
    'process.env': {
      // DO NOT EXPOSE THE ENTIRE process.env HERE - sensitive information on CI/CD could be exposed.
      VITE_ARIO_PROCESS_ID: process.env.VITE_ARIO_PROCESS_ID,
      VITE_AO_CU_URL: process.env.VITE_AO_CU_URL,
      VITE_GATEWAY_PROTOCOL: process.env.VITE_GATEWAY_PROTOCOL,
      VITE_GATEWAY_HOST: process.env.VITE_GATEWAY_HOST,
      VITE_ARWEAVE_GQL_ENDPOINT: process.env.VITE_ARWEAVE_GQL_ENDPOINT,
      VITE_GATEWAY_PORT: process.env.VITE_GATEWAY_PORT,
      VITE_REFERENCE_GATEWAY_FQDN: process.env.VITE_REFERENCE_GATEWAY_FQDN,
      VITE_GITHUB_HASH: process.env.VITE_GITHUB_HASH,
      npm_package_version: process.env.npm_package_version
    },
    'process.version': `"${process.version}"`,
    VITE_CONFIG: {
      version: JSON.stringify(process.env.npm_package_version),
    },
  },
  resolve: {
    alias: {
      '@tests': path.resolve(__dirname) + '/tests',
      '@src': path.resolve(__dirname) + '/src',
    },
  },
});
