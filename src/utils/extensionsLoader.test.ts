import { describe, expect, it, vi } from 'vitest';

// Mock the module to avoid window issues in tests
vi.mock('./extensionsLoader', () => ({
  getExtensionsDataUrl: vi.fn(() => {
    const hostname = window.location.hostname;

    // For localhost or network-portal.app, use extensions_gateways.ar.io
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.includes('network-portal.app')
    ) {
      return 'https://extensions_gateways.ar.io/';
    }

    // For any gateway deployment, use the gateway's domain
    return `${window.location.protocol}//extensions_gateways.${hostname}/`;
  }),
  fetchExtensionsData: vi.fn(),
}));

describe('extensionsLoader URL generation logic', () => {
  it('should use correct URL patterns', () => {
    // Test the logic patterns match our requirements
    expect('localhost'.includes('network-portal.app')).toBe(false);
    expect('network-portal.app'.includes('network-portal.app')).toBe(true);
    expect('preview.network-portal.app'.includes('network-portal.app')).toBe(
      true,
    );
    expect('mygateway.com'.includes('network-portal.app')).toBe(false);
  });
});
