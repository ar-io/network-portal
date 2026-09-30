import {
  classifyReportReadout,
  describeReportReadout,
} from '@src/utils/reportReadout';
import { describe, expect, it } from 'vitest';

const failed = (observer: string) => ({
  observer,
  outcome: { pass: false },
});
const passed = (observer: string) => ({
  observer,
  outcome: { pass: true },
});
const absent = (observer: string) => ({ observer, notAssessed: true });
const unread = (observer: string) => ({ observer, unreadable: 'HTTP 429' });

describe('classifyReportReadout', () => {
  it('separates a recorded pass from a report that says nothing', () => {
    // The distinction this module exists for. Both leave the reason list
    // empty, and only one of them means "no result".
    expect(
      classifyReportReadout(
        [failed('a'), passed('b'), absent('c'), unread('d')],
        ['a', 'b', 'c', 'd'],
      ),
    ).toEqual({ explained: 1, contradicted: 1, unassessed: 1 });
  });

  it('ignores verdicts for observers that did not fail this gateway', () => {
    expect(
      classifyReportReadout([failed('a'), failed('other')], ['a']),
    ).toEqual({ explained: 1, contradicted: 0, unassessed: 0 });
  });

  it('counts nothing when there are no verdicts', () => {
    expect(classifyReportReadout([], ['a'])).toEqual({
      explained: 0,
      contradicted: 0,
      unassessed: 0,
    });
  });
});

describe('describeReportReadout', () => {
  const base = { failingObservers: 3, readCount: 3, unreadableCount: 0 };

  it('leads with the reasons when there are any', () => {
    expect(
      describeReportReadout({
        ...base,
        readout: { explained: 2, contradicted: 0, unassessed: 1 },
      }),
    ).toBe('Reasons read from 2 of 3 reports.');
  });

  it('does not call a recorded pass "no result"', () => {
    // The bug this replaces: every verdict was a pass, and the panel said
    // none of the reports recorded a result for this gateway.
    const line = describeReportReadout({
      ...base,
      readout: { explained: 0, contradicted: 3, unassessed: 0 },
    });
    expect(line).not.toMatch(/none records a result/);
    expect(line).toBe(
      'Read 3 reports; 3 record this gateway as passing, which the on-chain result contradicts.',
    );
  });

  it('surfaces a contradiction alongside reasons rather than dropping it', () => {
    expect(
      describeReportReadout({
        ...base,
        readout: { explained: 2, contradicted: 1, unassessed: 0 },
      }),
    ).toBe(
      'Reasons read from 2 of 3 reports. 1 report instead records it as passing.',
    );
  });

  it('keeps "no result" for reports that genuinely omit this gateway', () => {
    expect(
      describeReportReadout({
        ...base,
        readout: { explained: 0, contradicted: 0, unassessed: 3 },
      }),
    ).toBe('Read 3 reports; none records a result for this gateway.');
  });

  it('reports nothing read as nothing read', () => {
    expect(
      describeReportReadout({
        failingObservers: 3,
        readCount: 0,
        unreadableCount: 3,
        readout: { explained: 0, contradicted: 0, unassessed: 0 },
      }),
    ).toBe('No report could be read. 3 could not be read.');
  });

  it('appends the unreadable tail to every outcome', () => {
    // A partial read must never present itself as a complete one.
    for (const readout of [
      { explained: 1, contradicted: 0, unassessed: 0 },
      { explained: 0, contradicted: 1, unassessed: 0 },
      { explained: 0, contradicted: 0, unassessed: 1 },
    ]) {
      expect(
        describeReportReadout({
          failingObservers: 3,
          readCount: 1,
          unreadableCount: 2,
          readout,
        }),
      ).toMatch(/2 could not be read\.$/);
    }
  });

  it('singularises one report throughout', () => {
    expect(
      describeReportReadout({
        failingObservers: 1,
        readCount: 1,
        unreadableCount: 1,
        readout: { explained: 0, contradicted: 1, unassessed: 0 },
      }),
    ).toBe(
      'Read 1 report; it records this gateway as passing, which the on-chain result contradicts. 1 could not be read.',
    );
  });
});
