/**
 * Utility to load extensions data from ArNS name
 */

/**
 * Gets the URL to fetch extensions data from based on the current environment
 */
export function getExtensionsDataUrl(): string {
  const hostname = window.location.hostname;

  // For localhost or network-portal.app, use extensions_gateways.ar.io
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('network-portal.app')
  ) {
    return 'https://extensions_gateways.ar.io/';
  }

  // For any gateway deployment, replace the first subdomain with extensions_gateways
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    parts[0] = 'extensions_gateways';
    return `${window.location.protocol}//${parts.join('.')}/`;
  }

  // Fallback for single-part domains (shouldn't happen in practice)
  return `${window.location.protocol}//extensions_gateways.${hostname}/`;
}

/**
 * Fetches extensions data from the appropriate source
 */
export async function fetchExtensionsData(): Promise<any> {
  const url = getExtensionsDataUrl();

  try {
    // First try to fetch from the ArNS URL
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch extensions data: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch extensions from ArNS:', error);

    // Fallback to local file if ArNS fetch fails
    console.log('Falling back to local extensions.json');
    const fallbackResponse = await fetch('/data/extensions.json');
    if (!fallbackResponse.ok) {
      throw new Error('Failed to fetch fallback extensions data');
    }
    return await fallbackResponse.json();
  }
}
