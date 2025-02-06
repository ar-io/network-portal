import { encode } from 'base64-arraybuffer';
import { isAddress } from 'viem';
import { ARNS_TX_ID_REGEX, THEME_TYPES } from '../constants';

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
export const formatWithCommas = (num: number) => {
  return COMMA_NUMBER_FORMAT.format(num);
};

/** Format number in range 0-1 to percentage (0 - 100%) string. */
export const formatPercentage = (num: number) => {
  return `${(num * 100).toFixed(2)}%`;
};

/** Format address to first 7...last 7 */
export const formatAddress = (address: string) => {
  const shownCount = 7;
  return `${address.slice(0, shownCount)}...${address.slice(
    address.length - shownCount,
    address.length,
  )}`;
};

/** Format primary names to truncate at end if length > than maxChars */
export const formatPrimaryName = (name: string, maxChars = 20) => {
  if (name.length < maxChars) {
    return name;
  }
  return name.slice(0, maxChars) + '...';
};

/** Convert Date object to format of YYYY-MM-DD */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/** Convert Date object to format of YYYY-MM-DD HH:MM:SS AM/PM */
export function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  return `${year}-${month}-${day}, ${hours}:${minutes}:${seconds} ${ampm}`;
}

/** Utility for simulating delay times. Useful for development work and testing;
 * do not use in production code. */
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Encode from base64 to base64URL (based on code by elliotsayes from https://github.com/elliotsayes/gateway-explorer) */
export const base64ToBase64url = (base64: string) => {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=*$/g, '');
};

/** Encode from arraybuffer to base64URL (based on code by elliotsayes from https://github.com/elliotsayes/gateway-explorer) */
export const arrayBufferToBase64Url = (arrayBuffer: ArrayBuffer) => {
  const base64 = encode(arrayBuffer);
  return base64ToBase64url(base64);
};

export const fetchWithTimeout = async (
  resource: string,
  options?: RequestInit,
  timeout?: number,
) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout ?? 10_000);

  const response = await fetch(resource, {
    ...options,
    headers: {
      ...options?.headers,
      'Accept-Encoding': 'identity',
    },
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
};

export function isArweaveTransactionID(id?: string) {
  if (!id) {
    return false;
  }
  if (!ARNS_TX_ID_REGEX.test(id)) {
    return false;
  }
  return true;
}

export function isEthAddress(address: string) {
  return isAddress(address, {
    strict: true,
  });
}

export function isValidAoAddress(address: string) {
  return isEthAddress(address) || isArweaveTransactionID(address);
}
