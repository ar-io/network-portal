import {
  applyOverlay,
  clearOverlays,
  noteSnapshotGeneratedAt,
  recordOverlay,
} from '@src/utils/snapshotOverlay';

const WROTE_AT = 1_700_000_000_000;
const BEFORE = WROTE_AT - 60_000;
const AFTER = WROTE_AT + 60_000;

const balance = (address: string, amount: number) => ({
  address,
  balance: amount,
});

describe('snapshotOverlay', () => {
  beforeEach(() => clearOverlays());

  it('leaves a document alone when nothing is pending', () => {
    const items = [balance('A', 1), balance('B', 2)];
    expect(applyOverlay('balances', items, BEFORE)).toEqual(items);
  });

  it('replaces a row the write changed', () => {
    recordOverlay('balances', [{ id: 'A', row: balance('A', 900) }], WROTE_AT);

    expect(
      applyOverlay('balances', [balance('A', 100), balance('B', 2)], BEFORE),
    ).toEqual([balance('A', 900), balance('B', 2)]);
  });

  it('appends a row the snapshot has never seen', () => {
    // A first-time recipient has no row in the published document at all.
    recordOverlay(
      'balances',
      [{ id: 'NEW', row: balance('NEW', 100) }],
      WROTE_AT,
    );

    expect(applyOverlay('balances', [balance('A', 1)], BEFORE)).toEqual([
      balance('A', 1),
      balance('NEW', 100),
    ]);
  });

  it('hides a row the write removed', () => {
    recordOverlay('vaults', [{ id: 'OWNER:3', row: null }], WROTE_AT);

    const items = [
      { address: 'OWNER', vaultId: '3' },
      { address: 'OWNER', vaultId: '4' },
    ];
    expect(applyOverlay('vaults', items, BEFORE)).toEqual([
      { address: 'OWNER', vaultId: '4' },
    ]);
  });

  describe('self-expiry', () => {
    it('drops the overlay once the snapshot is newer than the write', () => {
      recordOverlay(
        'balances',
        [{ id: 'A', row: balance('A', 900) }],
        WROTE_AT,
      );

      // A snapshot generated after the write already contains it.
      expect(applyOverlay('balances', [balance('A', 900)], AFTER)).toEqual([
        balance('A', 900),
      ]);

      // And the entry is gone, so a later stale read is not re-patched.
      expect(applyOverlay('balances', [balance('A', 100)], BEFORE)).toEqual([
        balance('A', 100),
      ]);
    });

    it('keeps applying while the snapshot still predates the write', () => {
      recordOverlay(
        'balances',
        [{ id: 'A', row: balance('A', 900) }],
        WROTE_AT,
      );

      for (let i = 0; i < 3; i++) {
        expect(applyOverlay('balances', [balance('A', 100)], BEFORE)).toEqual([
          balance('A', 900),
        ]);
      }
    });

    it('treats an unknown generatedAt as not yet caught up', () => {
      recordOverlay(
        'balances',
        [{ id: 'A', row: balance('A', 900) }],
        WROTE_AT,
      );
      expect(applyOverlay('balances', [balance('A', 100)], undefined)).toEqual([
        balance('A', 900),
      ]);
    });
  });

  it('keeps documents independent', () => {
    recordOverlay('balances', [{ id: 'A', row: balance('A', 900) }], WROTE_AT);
    const vaults = [{ address: 'A', vaultId: '1' }];
    expect(applyOverlay('vaults', vaults, BEFORE)).toEqual(vaults);
  });

  it('ignores documents with no identity function', () => {
    // `gateways` rows carry derived protocol math, so they are deliberately
    // not overlaid — nothing should happen if one is ever recorded.
    recordOverlay('gateways', [{ id: 'X', row: { a: 1 } }], WROTE_AT);
    const items = [{ b: 2 }];
    expect(applyOverlay('gateways', items as any, BEFORE)).toEqual(items);
  });

  it('clearing drops every document, which is what a network switch does', () => {
    // Overlay rows are keyed by document, not by network, so switching
    // networks must discard them — otherwise a row read on devnet is laid over
    // the mainnet document, defeating portalApi's network stamp.
    recordOverlay('balances', [{ id: 'A', row: balance('A', 900) }], WROTE_AT);
    recordOverlay('vaults', [{ id: 'A:1', row: null }], WROTE_AT);

    clearOverlays();

    expect(applyOverlay('balances', [balance('A', 100)], BEFORE)).toEqual([
      balance('A', 100),
    ]);
    const vaults = [{ address: 'A', vaultId: '1' }];
    expect(applyOverlay('vaults', vaults, BEFORE)).toEqual(vaults);
  });

  describe('expiry uses publisher time, not the client clock', () => {
    it('survives a client clock that is badly wrong', () => {
      // A laptop 15 minutes slow stamps the write in the past. Comparing that
      // against the publisher's clock would delete the entry on its first
      // application and silently reinstate the staleness bug.
      noteSnapshotGeneratedAt('balances', BEFORE);
      const skewedWrite = BEFORE - 15 * 60_000;
      recordOverlay(
        'balances',
        [{ id: 'A', row: balance('A', 900) }],
        skewedWrite,
      );

      // Same document as the one seen at write time: not superseded.
      expect(applyOverlay('balances', [balance('A', 100)], BEFORE)).toEqual([
        balance('A', 900),
      ]);
    });

    it('expires once a document newer than the one seen at write time lands', () => {
      noteSnapshotGeneratedAt('balances', BEFORE);
      recordOverlay('balances', [{ id: 'A', row: balance('A', 900) }], BEFORE);

      expect(applyOverlay('balances', [balance('A', 900)], AFTER)).toEqual([
        balance('A', 900),
      ]);
      expect(applyOverlay('balances', [balance('A', 100)], AFTER)).toEqual([
        balance('A', 100),
      ]);
    });

    it('falls back to the client clock when the document was never fetched', () => {
      recordOverlay(
        'balances',
        [{ id: 'A', row: balance('A', 900) }],
        WROTE_AT,
      );
      expect(applyOverlay('balances', [balance('A', 100)], BEFORE)).toEqual([
        balance('A', 900),
      ]);
    });
  });

  it('preserves the order of untouched rows', () => {
    recordOverlay('balances', [{ id: 'B', row: balance('B', 50) }], WROTE_AT);
    expect(
      applyOverlay(
        'balances',
        [balance('A', 1), balance('B', 2), balance('C', 3)],
        BEFORE,
      ),
    ).toEqual([balance('A', 1), balance('B', 50), balance('C', 3)]);
  });
});
