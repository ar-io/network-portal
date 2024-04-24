import { ARWEAVE_TX_REGEX } from '@ar.io/sdk';
import { Equatable } from '../types';

export class ArweaveTransactionID implements Equatable<ArweaveTransactionID> {
  constructor(private readonly transactionId?: string) {
    if (!transactionId || !ARWEAVE_TX_REGEX.test(transactionId)) {
      throw new Error(
        'Transaction ID should be a 43-character, alphanumeric string potentially including "-" and "_" characters.',
      );
    }
  }

  [Symbol.toPrimitive](hint?: string): string {
    if (hint === 'number') {
      throw new Error('Transaction IDs cannot be interpreted as a number!');
    }

    return this.toString();
  }

  toString(): string {
    return this.transactionId ?? '';
  }

  equals(entityId: ArweaveTransactionID): boolean {
    return this.transactionId === entityId.transactionId;
  }
}
