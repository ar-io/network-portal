import { summarizeGatewayAssessment } from '@src/utils/gatewayAssessment';

/** The shape observers actually publish, trimmed to what is read. */
const passing = {
  pass: true,
  ownershipAssessment: {
    pass: true,
    observedWallet: 'W',
    observedRelease: '84',
  },
  arnsAssessments: { prescribedNames: { record: { pass: true } } },
};

describe('summarizeGatewayAssessment', () => {
  it('reports a pass with nothing to explain', () => {
    expect(summarizeGatewayAssessment(passing)).toEqual({
      pass: true,
      reasons: [],
    });
  });

  /**
   * The case this was built for: perma.online in epoch 558. Observers fetched
   * `/ar-io/info` during the window and got a 503, so the ownership check
   * failed and the reason sat in the report the whole time.
   */
  it('quotes an ownership failure', () => {
    const r = summarizeGatewayAssessment({
      pass: false,
      ownershipAssessment: {
        pass: false,
        failureReason: 'Response code 503 (Service Unavailable)',
      },
    });

    expect(r?.pass).toBe(false);
    expect(r?.reasons).toEqual([
      'Response code 503 (Service Unavailable) — ownership check',
    ]);
  });

  it('names the ArNS name that failed and why', () => {
    const r = summarizeGatewayAssessment({
      pass: false,
      ownershipAssessment: { pass: true },
      arnsAssessments: {
        chosenNames: {
          cybersecurity: {
            pass: false,
            failureReason: 'dataHashDigest mismatch',
          },
        },
      },
    });

    expect(r?.reasons).toEqual([
      'dataHashDigest mismatch — ArNS “cybersecurity”',
    ]);
  });

  it('falls back to the status codes when no reason is given', () => {
    const r = summarizeGatewayAssessment({
      pass: false,
      arnsAssessments: {
        prescribedNames: {
          record: {
            pass: false,
            expectedStatusCode: 200,
            resolvedStatusCode: 404,
          },
        },
      },
    });

    expect(r?.reasons).toEqual(['returned 404, expected 200 — ArNS “record”']);
  });

  it('keeps distinct failures apart', () => {
    const r = summarizeGatewayAssessment({
      pass: false,
      ownershipAssessment: { pass: false, failureReason: 'timeout' },
      arnsAssessments: {
        prescribedNames: { a: { pass: false, failureReason: 'x' } },
        chosenNames: { b: { pass: false, failureReason: 'y' } },
      },
    });

    expect(r?.reasons).toHaveLength(3);
  });

  /**
   * A gateway that is down fails every check with the same message. One real
   * observer recorded a 503 against the ownership check and ten ArNS names —
   * eleven identical lines, which bury the one fact that matters.
   */
  it('merges one reason reported by many checks', () => {
    const down = 'Response code 503 (Service Unavailable)';
    const name = (n: number) => [
      `name${n}`,
      { pass: false, failureReason: down },
    ];

    const r = summarizeGatewayAssessment({
      pass: false,
      ownershipAssessment: { pass: false, failureReason: down },
      arnsAssessments: {
        prescribedNames: Object.fromEntries([name(1), name(2)]),
        chosenNames: Object.fromEntries([name(3), name(4), name(5)]),
      },
    });

    expect(r?.reasons).toEqual([`${down} — ownership check and 5 ArNS names`]);
  });

  /** Few enough to name are named, rather than counted. */
  it('names one or two affected ArNS entries', () => {
    const r = summarizeGatewayAssessment({
      pass: false,
      arnsAssessments: {
        chosenNames: {
          alpha: { pass: false, failureReason: 'gone' },
          beta: { pass: false, failureReason: 'gone' },
        },
      },
    });

    expect(r?.reasons).toEqual(['gone — ArNS “alpha” and “beta”']);
  });

  /**
   * A failure the report does not explain is still a failure. Inferring the
   * verdict from the reasons would turn it into a pass.
   */
  it('keeps a failure that explains nothing', () => {
    const r = summarizeGatewayAssessment({ pass: false });

    expect(r).toEqual({ pass: false, reasons: [] });
  });

  /**
   * An observer assesses the registry as it stood when they ran, so a gateway
   * can be legitimately absent from a report. Absent is not a pass.
   */
  it('is undefined for anything that is not an assessment', () => {
    expect(summarizeGatewayAssessment(undefined)).toBeUndefined();
    expect(summarizeGatewayAssessment(null)).toBeUndefined();
    expect(summarizeGatewayAssessment('nope')).toBeUndefined();
  });

  it('survives a report missing the sections it reads', () => {
    expect(
      summarizeGatewayAssessment({ pass: true, arnsAssessments: null }),
    ).toEqual({
      pass: true,
      reasons: [],
    });
  });
});
