/// <reference types="vite/client" />
/**
 * Declares the `*.svg?react` modules `vite-plugin-svgr` produces.
 *
 * This lives here rather than in the icon barrel because a triple-slash
 * directive is only honoured above every statement in its file. In the barrel
 * it sat above the imports, so Biome's import sorter silently moved a new
 * import in front of it — and TypeScript then ignored the directive and
 * stopped resolving every `?react` import in the project. A declaration file
 * has no imports to be sorted ahead of it.
 */
/// <reference types="vite-plugin-svgr/client" />

declare const __NPM_PACKAGE_VERSION__: string;

// useful for intellisense to auto detect available env vars
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_NODE_ENV: string;
  readonly VITE_GITHUB_HASH: string;
  readonly VITE_SOLANA_RPC_URL: string;
  readonly VITE_SOLANA_MAINNET_RPC_URL: string;
  readonly VITE_PORTAL_API_URL: string;
  readonly VITE_PORTAL_MAINNET_API_URL: string;
  readonly VITE_PORTAL_DEVNET_API_URL: string;
  readonly VITE_ARIO_CORE_PROGRAM_ID: string;
  readonly VITE_ARIO_GAR_PROGRAM_ID: string;
  readonly VITE_ARIO_ARNS_PROGRAM_ID: string;
  readonly VITE_ARIO_ANT_PROGRAM_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
