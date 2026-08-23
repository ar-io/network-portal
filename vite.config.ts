import path from 'path';
/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: false,
  build: {
    // Sourcemaps existed to make Sentry stack traces readable. With Sentry
    // gone they are ~13MB of dead weight stored permanently on Arweave with
    // every deploy, so they are no longer emitted.
    sourcemap: false,
    minify: true,
    cssMinify: true,
  },
  plugins: [svgr(), react(), nodePolyfills()],
  base: '',
  define: {
    __NPM_PACKAGE_VERSION__: JSON.stringify(packageJson.version),
    'process.env': {
      // DO NOT EXPOSE THE ENTIRE process.env HERE - sensitive information on CI/CD could be exposed.
      // defining here as an empty object as there are errors otherwise
    },
    'process.version': `"${process.version}"`,
  },
  resolve: {
    alias: {
      '@tests': path.resolve(__dirname) + '/tests',
      '@src': path.resolve(__dirname) + '/src',
    },
  },
});
