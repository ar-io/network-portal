/**
 * Utility to load extensions data from ArNS name
 */

import type { Extension, ExtensionCategory, ExtensionTag } from '@src/types';

interface ExtensionsData {
  extensions: Extension[];
}

const HTTP_URL_PROTOCOLS = new Set(['http:', 'https:']);
const EXTENSION_CATEGORIES = [
  'storage',
  'routing',
  'monitoring',
  'security',
  'performance',
  'indexing',
  'caching',
  'moderation',
  'analytics',
  'developer-tools',
  'compute',
] as const satisfies readonly ExtensionCategory[];
const EXTENSION_TAGS = [
  'featured',
  'grant-funded',
  'community',
  'official',
  'beta',
  'stable',
] as const satisfies readonly ExtensionTag[];
const EXTENSION_CATEGORY_SET = new Set<string>(EXTENSION_CATEGORIES);
const EXTENSION_TAG_SET = new Set<string>(EXTENSION_TAGS);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeHttpUrl(value: unknown): string | undefined {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  try {
    const url = new URL(value);
    return HTTP_URL_PROTOCOLS.has(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function normalizeCategory(value: unknown): ExtensionCategory | undefined {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  const category = value.trim().toLowerCase();
  return EXTENSION_CATEGORY_SET.has(category)
    ? (category as ExtensionCategory)
    : undefined;
}

function normalizeTags(value: unknown): ExtensionTag[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return Array.from(
    new Set(
      value.flatMap((tag) => {
        if (!isNonEmptyString(tag)) {
          return [];
        }

        const normalizedTag = tag.trim().toLowerCase();
        return EXTENSION_TAG_SET.has(normalizedTag)
          ? [normalizedTag as ExtensionTag]
          : [];
      }),
    ),
  );
}

function optionalStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : undefined;
}

function validateExtension(extension: unknown): Extension | undefined {
  if (!isPlainObject(extension)) {
    return undefined;
  }

  const {
    id,
    name,
    description,
    longDescription,
    author,
    authorUrl,
    url,
    category,
    tags,
    version,
    imageUri,
    lastUpdated,
    minGatewayVersion,
    documentation,
    logo,
    screenshots,
  } = extension;

  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(name) ||
    !isNonEmptyString(description) ||
    !isNonEmptyString(longDescription) ||
    !isNonEmptyString(author) ||
    !isNonEmptyString(lastUpdated)
  ) {
    return undefined;
  }

  const safeUrl = normalizeHttpUrl(url);
  const safeCategory = normalizeCategory(category);
  const safeTags = normalizeTags(tags);

  if (!safeUrl || !safeCategory || !safeTags) {
    return undefined;
  }

  const safeAuthorUrl = normalizeHttpUrl(authorUrl);
  const safeDocumentation = normalizeHttpUrl(documentation);
  const safeVersion = optionalString(version);
  const safeImageUri = optionalString(imageUri);
  const safeMinGatewayVersion = optionalString(minGatewayVersion);
  const safeLogo = optionalString(logo);
  const safeScreenshots = optionalStringArray(screenshots);

  return {
    id,
    name,
    description,
    longDescription,
    author,
    ...(safeAuthorUrl && { authorUrl: safeAuthorUrl }),
    url: safeUrl,
    category: safeCategory,
    tags: safeTags,
    ...(safeVersion && { version: safeVersion }),
    ...(safeImageUri && { imageUri: safeImageUri }),
    lastUpdated,
    ...(safeMinGatewayVersion && {
      minGatewayVersion: safeMinGatewayVersion,
    }),
    ...(safeDocumentation && {
      documentation: safeDocumentation,
    }),
    ...(safeLogo && { logo: safeLogo }),
    ...(safeScreenshots && { screenshots: safeScreenshots }),
  };
}

export function validateExtensionsData(data: unknown): ExtensionsData {
  if (!isPlainObject(data) || !Array.isArray(data.extensions)) {
    return { extensions: [] };
  }

  return {
    extensions: data.extensions.flatMap((extension) => {
      const validatedExtension = validateExtension(extension);
      return validatedExtension ? [validatedExtension] : [];
    }),
  };
}

/**
 * Gets the URL to fetch extensions data from based on the current environment
 */
export function getExtensionsDataUrl(): string {
  const hostname = window.location.hostname;

  // For localhost, network-portal.app, or Firebase preview URLs, use extensions_gateways.ar.io
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('network-portal.app') ||
    hostname.includes('.web.app') ||
    hostname.includes('.firebaseapp.com')
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
export async function fetchExtensionsData(): Promise<ExtensionsData> {
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
    return validateExtensionsData(data);
  } catch (error) {
    console.error('Failed to fetch extensions from ArNS:', error);

    // Fallback to local file if ArNS fetch fails
    console.log('Falling back to local extensions.json');
    const fallbackResponse = await fetch('/data/extensions.json');
    if (!fallbackResponse.ok) {
      throw new Error('Failed to fetch fallback extensions data');
    }
    return validateExtensionsData(await fallbackResponse.json());
  }
}
