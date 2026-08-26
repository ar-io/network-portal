import type { WalletVault } from '@ar.io/sdk/web';
import { vaultRowsFor } from '@src/utils/vaultRows';

const ME = 'ME_ADDRESS';
const ALICE = 'ALICE_ADDRESS';
const BOB = 'BOB_ADDRESS';
const NOW = new Date('2026-08-26T12:00:00Z').getTime();
const DAY = 86_400_000;

const vault = (over: Partial<WalletVault> & { address: string }): WalletVault =>
  ({
    cursorId: `pda-${over.address}-${over.vaultId ?? '0'}`,
    vaultId: '0',
    balance: 100_000_000,
    startTimestamp: NOW - 10 * DAY,
    endTimestamp: NOW + 20 * DAY,
    ...over,
  }) as WalletVault;

describe('vaultRowsFor', () => {
  describe('the undefined-matches-undefined hole', () => {
    it('returns nothing when there is no address to match', () => {
      // `controller` is undefined on every non-revocable vault, so comparing it
      // against an absent page address would match all of them.
      const vaults = [
        vault({ address: ALICE, controller: undefined }),
        vault({ address: BOB, controller: undefined }),
      ];

      expect(vaultRowsFor(vaults, undefined, NOW)).toEqual([]);
      expect(vaultRowsFor(vaults, '', NOW)).toEqual([]);
    });

    it('does not match a controller-less vault to any real address', () => {
      const vaults = [vault({ address: ALICE, controller: undefined })];
      expect(vaultRowsFor(vaults, ME, NOW)).toEqual([]);
    });
  });

  describe('selection', () => {
    it('includes vaults the address owns', () => {
      const rows = vaultRowsFor([vault({ address: ME })], ME, NOW);
      expect(rows).toHaveLength(1);
      expect(rows[0].role).toBe('owned');
    });

    it('includes vaults the address controls but does not own', () => {
      const rows = vaultRowsFor(
        [vault({ address: ALICE, controller: ME })],
        ME,
        NOW,
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].role).toBe('sent');
    });

    it('excludes vaults the address neither owns nor controls', () => {
      const rows = vaultRowsFor(
        [vault({ address: ALICE, controller: BOB })],
        ME,
        NOW,
      );
      expect(rows).toEqual([]);
    });

    it('handles an absent vault list', () => {
      expect(vaultRowsFor(undefined, ME, NOW)).toEqual([]);
    });
  });

  describe('counterparty', () => {
    it('is the recipient on a sent row, not the viewer', () => {
      // The controller column showed the viewer's own address here, so two
      // vaults sent to different people were indistinguishable.
      const rows = vaultRowsFor(
        [
          vault({ address: ALICE, controller: ME, vaultId: '1' }),
          vault({ address: BOB, controller: ME, vaultId: '2' }),
        ],
        ME,
        NOW,
      );
      expect(rows.map((r) => r.counterparty)).toEqual([ALICE, BOB]);
    });

    it('is the sender on an owned revocable row', () => {
      const rows = vaultRowsFor(
        [vault({ address: ME, controller: ALICE })],
        ME,
        NOW,
      );
      expect(rows[0].counterparty).toBe(ALICE);
    });

    it('is empty on an owned vault nobody controls', () => {
      const rows = vaultRowsFor(
        [vault({ address: ME, controller: undefined })],
        ME,
        NOW,
      );
      expect(rows[0].counterparty).toBe('');
    });
  });

  describe('controller', () => {
    it('stays the literal controller, which is who may revoke', () => {
      const rows = vaultRowsFor(
        [vault({ address: ALICE, controller: ME })],
        ME,
        NOW,
      );
      // Distinct from `counterparty`, which is ALICE on this row.
      expect(rows[0].controller).toBe(ME);
      expect(rows[0].counterparty).toBe(ALICE);
    });

    it('is empty when the vault is not revocable', () => {
      const rows = vaultRowsFor([vault({ address: ME })], ME, NOW);
      expect(rows[0].controller).toBe('');
    });
  });

  describe('vaultAddress', () => {
    it('is always the owner, which is what revokeVault derives the PDA from', () => {
      const rows = vaultRowsFor(
        [vault({ address: ALICE, controller: ME })],
        ME,
        NOW,
      );
      expect(rows[0].vaultAddress).toBe(ALICE);
    });
  });

  describe('derived values', () => {
    it('converts the balance from mARIO to ARIO', () => {
      const rows = vaultRowsFor(
        [vault({ address: ME, balance: 250_000_000 })],
        ME,
        NOW,
      );
      expect(rows[0].balance).toBe(250);
    });

    it('counts days remaining against the supplied clock', () => {
      const rows = vaultRowsFor(
        [vault({ address: ME, endTimestamp: NOW + 20 * DAY })],
        ME,
        NOW,
      );
      expect(rows[0].daysRemaining).toBe(20);
    });

    it('goes negative once a vault has unlocked', () => {
      // Vaults persist until the owner releases them, so long-expired rows are
      // normal — the table renders these as "Unlocked" rather than "-412".
      const rows = vaultRowsFor(
        [vault({ address: ME, endTimestamp: NOW - 412 * DAY })],
        ME,
        NOW,
      );
      expect(rows[0].daysRemaining).toBeLessThan(0);
    });
  });
});
