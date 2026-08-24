/**
 * `fetchPortalDocument` takes `expectedProgramIds` as an optional parameter
 * defaulting to `{}`, and `programIdsDisagree` returns null for an empty
 * object. So a call site that forgets to pass the ids does not fail to
 * compile, does not fail a unit test, and silently downgrades the program-id
 * check to a no-op — the defense exists but never fires.
 *
 * That is exactly how it shipped before this guard: every one of the eight
 * call sites omitted the argument. This asserts they all pass it.
 *
 * Sources are read through `import.meta.glob('?raw')` rather than `node:fs`,
 * which `vite-plugin-node-polyfills` shims out from under the test.
 */

const hookSources = import.meta.glob('../../src/hooks/*.ts', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const PORTAL_CALLS =
  /\b(snapshotOrRpc|fetchPortalDocument|fetchPortalSummary)\s*[<(]/;

describe('portal program id wiring', () => {
  const callers = Object.entries(hookSources).filter(([, source]) =>
    PORTAL_CALLS.test(source),
  );

  it('finds the hooks that read the portal API', () => {
    // Guards the guard: if the glob or regex stops matching, the suite below
    // would vacuously pass over an empty list.
    expect(callers.length).toBeGreaterThan(0);
  });

  it.each(callers.map(([file]) => file))(
    '%s passes the configured program ids, so a mismatched deploy is refused',
    (file) => {
      const source = hookSources[file];
      expect(source).toContain('usePortalProgramIds');
      expect(source).toContain('portalProgramIds');
    },
  );
});
