import path from 'path';
/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: false,
  build: {
    sourcemap: false,
    minify: true,
    cssMinify: true,
  },
  plugins: [svgr(), react(), nodePolyfills()],
  base: '',
  test: {
    globals: true,
  },
  define: {
    __NPM_PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
    'process.env': {
      // DO NOT EXPOSE THE ENTIRE process.env HERE - sensitive information on CI/CD could be exposed.
      // defining here as an empty object as there are errors otherwise
    },
  },
  resolve: {
    alias: {
      '@tests': path.resolve(__dirname) + '/tests',
      '@src': path.resolve(__dirname) + '/src',
    },
  },
});
