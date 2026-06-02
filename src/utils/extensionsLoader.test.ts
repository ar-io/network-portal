import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getExtensionsDataUrl,
  validateExtensionsData,
} from './extensionsLoader';

const validExtension = {
  id: 'safe-extension',
  name: 'Safe Extension',
  description: 'A safe extension',
  longDescription: 'A longer safe extension description',
  author: 'AR.IO Labs',
  authorUrl: 'https://ar.io/',
  url: 'https://github.com/ar-io/network-portal',
  category: 'storage',
  tags: ['official', 'stable'],
  version: '1.0.0',
  lastUpdated: '2025-01-08',
  documentation: 'https://docs.ar.io/gateways/bundler',
};

describe('extensionsLoader URL generation logic', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the shared extensions registry for portal and local hostnames', () => {
    vi.stubGlobal('window', {
      location: {
        hostname: 'network-portal.app',
        protocol: 'https:',
      },
    });

    expect(getExtensionsDataUrl()).toBe('https://extensions_gateways.ar.io/');
  });

  it('uses the gateway-derived extensions registry for other hostnames', () => {
    vi.stubGlobal('window', {
      location: {
        hostname: 'gateway.example.com',
        protocol: 'https:',
      },
    });

    expect(getExtensionsDataUrl()).toBe(
      'https://extensions_gateways.example.com/',
    );
  });
});

describe('validateExtensionsData', () => {
  it('keeps valid extensions with http URLs', () => {
    expect(validateExtensionsData({ extensions: [validExtension] })).toEqual({
      extensions: [validExtension],
    });
  });

  it('rejects extensions with non-http primary URLs', () => {
    expect(
      validateExtensionsData({
        extensions: [
          validExtension,
          {
            ...validExtension,
            id: 'javascript-url',
            url: 'javascript:alert(1)',
          },
          {
            ...validExtension,
            id: 'data-url',
            url: 'data:text/html,<h1>x</h1>',
          },
        ],
      }),
    ).toEqual({ extensions: [validExtension] });
  });

  it('drops optional external URLs that are not http URLs', () => {
    expect(
      validateExtensionsData({
        extensions: [
          {
            ...validExtension,
            authorUrl: 'javascript:alert(1)',
            documentation: 'ftp://example.com/docs',
          },
        ],
      }),
    ).toEqual({
      extensions: [
        {
          ...validExtension,
          authorUrl: undefined,
          documentation: undefined,
        },
      ],
    });
  });

  it('returns an empty extension list for malformed registry data', () => {
    expect(validateExtensionsData({ extensions: 'not an array' })).toEqual({
      extensions: [],
    });
  });
});
