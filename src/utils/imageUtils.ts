/**
 * Converts an image reference (Arweave TX ID or HTTPS URL) to a full URL
 * @param imageRef - Either an Arweave transaction ID or a full HTTPS URL
 * @returns Full URL to the image
 */
export function getImageUrl(imageRef: string): string {
  // If it's already a full URL, use it as-is
  if (imageRef.startsWith('http://') || imageRef.startsWith('https://')) {
    return imageRef;
  }

  // Otherwise, treat it as an Arweave transaction ID
  const hostname = window.location.hostname;

  // Check if we're on a known ArNS gateway (but not localhost)
  if (
    (hostname.includes('.ar.io') ||
      hostname.includes('.arweave.net') ||
      hostname.includes('.permagate.io')) &&
    !hostname.includes('localhost')
  ) {
    // Use relative URL for gateway access
    return `/${imageRef}`;
  }

  // Fallback to arweave.net for centralized hosting
  return `https://arweave.net/${imageRef}`;
}

/**
 * Category-based gradient colors for placeholder images
 */
export const CATEGORY_GRADIENTS: Record<string, string> = {
  storage: 'from-blue-600 to-blue-800',
  routing: 'from-purple-600 to-purple-800',
  monitoring: 'from-green-600 to-green-800',
  security: 'from-red-600 to-red-800',
  performance: 'from-orange-600 to-orange-800',
  indexing: 'from-yellow-600 to-yellow-800',
  caching: 'from-cyan-600 to-cyan-800',
  moderation: 'from-pink-600 to-pink-800',
  analytics: 'from-indigo-600 to-indigo-800',
  'developer-tools': 'from-gray-600 to-gray-800',
  compute: 'from-violet-600 to-violet-800',
};
