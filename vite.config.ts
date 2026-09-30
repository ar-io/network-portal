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
    rollupOptions: {
      output: {
        /**
         * Hold every dependency in one chunk, separate from application code.
         *
         * This is about deploy cost, not load time. `ar-io-deploy` dedupes
         * per file against the previous release, so an unchanged file is
         * never re-uploaded or re-paid — but a chunk's name carries a hash of
         * its contents, so a chunk counts as unchanged only if everything
         * inside it is.
         *
         * Everything used to share one entry chunk: application code and
         * every dependency, 3.4MB of a 4.4MB deploy. Editing one line of copy
         * rewrote that chunk, so every release re-uploaded all 3.4MB,
         * permanently. Now the entry is ~205KB of code that changes on every
         * release and the dependencies sit in a chunk that does not change
         * between releases at all.
         *
         * **A finer split does not work here, and the failure is invisible to
         * the build.** Grouping by upgrade cadence — charts, web3.js and its
         * Node crypto polyfills, the ar.io packages, the rest — builds
         * cleanly, is meaningfully smaller still, and then white-screens
         * every route with "Cannot access 'j0' before initialization". The
         * `@solana` packages are circularly entangled, so a boundary drawn
         * through them reorders their initialisation. Anything beyond this
         * one predicate has to be proved by loading the built output, not by
         * a green build.
         */
        manualChunks(id: string) {
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
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
