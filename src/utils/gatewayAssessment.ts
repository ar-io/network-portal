/**
 * What one observer said about one gateway, read from their report.
 *
 * The on-chain observation is a bitmap indexed by the gateway's slot in that
 * epoch's registry, and the archive publishes only a digest of that ordering —
 * so a closed epoch can be counted but not attributed. The report the observer
 * uploaded has no such problem: it is keyed by FQDN and carries the reason.
 */
export type AssessmentOutcome = {
  pass: boolean;
  /** Empty for a pass, and for a failure the report did not explain. */
  reasons: string[];
};

type ArnsEntry = {
  pass?: boolean;
  failureReason?: string;
  expectedStatusCode?: number;
  resolvedStatusCode?: number;
};

type Assessment = {
  pass?: boolean;
  ownershipAssessment?: {
    pass?: boolean;
    failureReason?: string;
    expectedWallets?: string[];
    observedWallet?: string;
  };
  arnsAssessments?: Record<string, Record<string, ArnsEntry> | unknown>;
};

/** `prescribedNames` / `chosenNames` read the same; the label says which. */
const ARNS_GROUPS: ReadonlyArray<[key: string, label: string]> = [
  ['prescribedNames', 'prescribed name'],
  ['chosenNames', 'chosen name'],
];

const describeArnsFailure = (entry: ArnsEntry): string => {
  if (entry.failureReason) return entry.failureReason;
  // A status mismatch is the common unexplained case and is worth naming.
  if (
    typeof entry.resolvedStatusCode === 'number' &&
    entry.resolvedStatusCode !== entry.expectedStatusCode
  ) {
    return `returned ${entry.resolvedStatusCode}, expected ${entry.expectedStatusCode}`;
  }
  return 'failed';
};

/**
 * A gateway that is simply down fails every check with the same message — one
 * observer recorded a 503 against the ownership check and ten ArNS names, all
 * identical. Listing them line by line buries the one fact that matters, so
 * identical reasons are merged and the checks they cover are counted.
 */
const describeScope = (names: string[], ownership: boolean): string => {
  const arns =
    names.length === 0
      ? ''
      : names.length <= 2
        ? `ArNS ${names.map((n) => `“${n}”`).join(' and ')}`
        : `${names.length} ArNS names`;
  if (ownership && arns) return `ownership check and ${arns}`;
  if (ownership) return 'ownership check';
  return arns;
};

/**
 * Summarise one gateway's entry in one report.
 *
 * Returns undefined when the report does not mention the gateway at all —
 * which is not a pass and must not be rendered as one. An observer assesses
 * the registry as it stood when they ran, so a gateway that joined mid-epoch
 * is legitimately absent from some reports.
 */
export const summarizeGatewayAssessment = (
  assessment: unknown,
): AssessmentOutcome | undefined => {
  if (assessment === null || typeof assessment !== 'object') return undefined;

  const a = assessment as Assessment;

  // reason -> the checks that reported it
  const byReason = new Map<string, { ownership: boolean; names: string[] }>();
  const record = (reason: string, name?: string) => {
    const entry = byReason.get(reason) ?? { ownership: false, names: [] };
    if (name === undefined) entry.ownership = true;
    else entry.names.push(name);
    byReason.set(reason, entry);
  };

  const ownership = a.ownershipAssessment;
  if (ownership && ownership.pass === false) {
    record(
      ownership.failureReason ??
        (ownership.observedWallet &&
        ownership.expectedWallets?.length &&
        !ownership.expectedWallets.includes(ownership.observedWallet)
          ? `served by ${ownership.observedWallet}`
          : 'failed'),
    );
  }

  for (const [key] of ARNS_GROUPS) {
    const group = a.arnsAssessments?.[key];
    if (group === null || typeof group !== 'object') continue;
    for (const [name, entry] of Object.entries(
      group as Record<string, ArnsEntry>,
    )) {
      if (entry !== null && typeof entry === 'object' && entry.pass === false) {
        record(describeArnsFailure(entry), name);
      }
    }
  }

  const reasons = [...byReason.entries()].map(
    ([reason, { ownership: own, names }]) =>
      `${reason} — ${describeScope(names, own)}`,
  );

  // Trust the report's own verdict rather than inferring it from the reasons:
  // a failure it did not explain is still a failure, and must not read as a
  // pass just because nothing could be quoted.
  return { pass: a.pass === true, reasons };
};
