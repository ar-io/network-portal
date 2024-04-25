import { ArIO, ArweaveSigner, DENOMINATIONS } from "@ar.io/sdk";



import { THEME_TYPES } from './constants';
import { loadWallet } from "./utilities";


// for tailwind css, need the change the root
export const applyThemePreference = (theme: string) => {
  const { DARK, LIGHT } = THEME_TYPES;
  const root = window.document.documentElement;
  const isDark = theme === DARK;
  root.classList.remove(isDark ? LIGHT : DARK);
  root.classList.add(theme);
};

const contractId = 'bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U';
const faucetAmount = 1000;

export async function airdropTestTokens(
  arweaveWallet: string,
): Promise<string> {
  // Get the key file used for the distribution
  const wallet = loadWallet();
  const nodeSigner = new ArweaveSigner(wallet);

  // read and write client that has access to all APIs
  const arIOWriteable = ArIO.init({
    signer: nodeSigner,
    contractTxId: contractId,
  });

  const transfer = await arIOWriteable.transfer({
    target: arweaveWallet,
    qty: faucetAmount,
    denomination: DENOMINATIONS.IO,
  });

  console.log(
    `Airdropped ${faucetAmount} tIO to ${arweaveWallet} with txId ${transfer.id}`,
  );
  return transfer.id;
}
