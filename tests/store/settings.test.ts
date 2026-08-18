import { SETTINGS_VERSION, migrateSettings } from '@src/store/settings';

/**
 * Regression cover for the 401 that followed a provider token rotation.
 *
 * `merge` lets persisted values win over the build's defaults, so an RPC
 * endpoint saved by an older build outlives the upgrade that replaced it. Once
 * the old auth token is revoked, every returning user calls a dead endpoint
 * while new visitors are fine — which is exactly what shipped in v2.4.0.
 */
describe('migrateSettings', () => {
  const legacyState = {
    solanaRpcUrl:
      'https://example-old.solana-mainnet.quiknode.pro/revokedtoken/',
    solanaCoreProgramId: 'CoreOld',
    solanaGarProgramId: 'GarOld',
    solanaArnsProgramId: 'ArnsOld',
    solanaAntProgramId: 'AntOld',
    bridgeBalanceAddress: 'BridgeOld',
    solanaAddressSettingsByNetwork: {
      'https://example-old.solana-mainnet.quiknode.pro/revokedtoken/': {
        solanaCoreProgramId: 'CoreOld',
      },
    },
    sidebarOpen: false,
    arweaveGqlUrl: 'https://gql.example/graphql',
  };

  it('drops an endpoint persisted by an older build', () => {
    const migrated = migrateSettings(legacyState, 0);

    expect(migrated).not.toHaveProperty('solanaRpcUrl');
  });

  it('drops program ids keyed to the old endpoint', () => {
    const migrated = migrateSettings(legacyState, 0) as Record<string, unknown>;

    for (const key of [
      'solanaCoreProgramId',
      'solanaGarProgramId',
      'solanaArnsProgramId',
      'solanaAntProgramId',
      'bridgeBalanceAddress',
      'solanaAddressSettingsByNetwork',
    ]) {
      expect(migrated).not.toHaveProperty(key);
    }
  });

  it('preserves preferences unrelated to the network', () => {
    const migrated = migrateSettings(legacyState, 0);

    expect(migrated.sidebarOpen).toBe(false);
    expect(migrated.arweaveGqlUrl).toBe('https://gql.example/graphql');
  });

  it('does not mutate the state handed to it', () => {
    migrateSettings(legacyState, 0);

    expect(legacyState.solanaRpcUrl).toBe(
      'https://example-old.solana-mainnet.quiknode.pro/revokedtoken/',
    );
  });

  it('leaves an already-migrated store untouched', () => {
    const current = {
      solanaRpcUrl: 'https://example-new.solana-mainnet.quiknode.pro/live/',
    };

    expect(migrateSettings(current, SETTINGS_VERSION)).toEqual(current);
  });

  it('does not re-run on a future version', () => {
    const current = {
      solanaRpcUrl: 'https://example-new.solana-mainnet.quiknode.pro/live/',
    };

    expect(migrateSettings(current, SETTINGS_VERSION + 1)).toEqual(current);
  });

  it('tolerates an absent or empty persisted store', () => {
    expect(migrateSettings(undefined, 0)).toEqual({});
    expect(migrateSettings(null, 0)).toEqual({});
    expect(migrateSettings({}, 0)).toEqual({});
  });
});
