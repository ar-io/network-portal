import { THEME_TYPES } from '../constants';

const COMMA_NUMBER_FORMAT = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

// for tailwind css, need the change the root
export const applyThemePreference = (theme: string) => {
  const { DARK, LIGHT } = THEME_TYPES;
  const root = window.document.documentElement;
  const isDark = theme === DARK;
  root.classList.remove(isDark ? LIGHT : DARK);
  root.classList.add(theme);
};

export const executeWithTimeout = async (fn: () => any, ms: number) => {
  return await Promise.race([
    fn(),
    new Promise((resolve) => setTimeout(() => resolve('timeout'), ms)),
  ]);
};

export const formatWalletAddress = (address: string) => {
  const shownCount = 4;
  return `${address.slice(0, shownCount)}...${address.slice(
    address.length - shownCount,
    address.length,
  )}`;
};

export const formatBalance = (ar: number) => {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
    compactDisplay: 'short',
  }).format(ar);
};

/** Format number with commas, with maximum one fraction digit */
export function formatWithCommas(num: number) {
  return COMMA_NUMBER_FORMAT.format(num);
}

/** Utility for simulating delay times. Useful for development work and testing; 
 * do not use in production code. */
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));