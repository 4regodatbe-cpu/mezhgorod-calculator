# M4 endpoint conflict audit — 2026-10-13

## Purpose

The approved V3 model identifies the first and last tariff sections on one continuous toll-road trip, then looks up a finished matrix fare. It does not inspect intermediate exits or add individual plaza amounts during the trip.

## Root cause

The offline generator expands alternative tariff-section chains and saves each finished sum under its full chain. Those complete keys can be unique while collapsing to the same first/last section pair. If their saved totals differ, a runtime lookup by just the two boundaries is ambiguous. This explains why the previous full-key duplicate check did not find duplicate records.

## Change

- The matrix generator now groups candidate records by ordered `(first section, last section, tariff profile)`, expanding compound section IDs before comparing endpoints.
- A group is runtime eligible only if every source chain in that key has exactly one common amount.
- Conflicting groups and all source chains are retained in the generated matrix for audit, flagged `audit-only-ambiguous-endpoint-cell` and `runtimeEligible: false`.
- The compiled endpoint adapter accepts only `runtimeEligible: true` rows. A known conflict returns `unknown` with `ambiguous-fare-version`; it does not select first/minimum/maximum amount.
- Each direction has a separate key. The adapter no longer invents a reverse fare from a forward candidate. Existing Yandex-reviewed cells override only their exact directed keys.
- The matrix validator checks conflict counts, eligibility and emitted runtime spans.

## Results on this input

| Measure | Result |
|---|---:|
| Generated fare rows | 4,699 |
| M4 candidate rows | 1,456 |
| Conflicting ordered endpoint/profile groups quarantined | 428 |
| Unique M4 endpoint/profile groups eligible | 360 |
| Previously reviewed Yandex cells | 4 |

These are generator-key counts for this checkout, not a count of roads or real-world routes checked. The four Yandex cells remain visibly unconfirmed estimates. This change does not verify any of the other conflicting source chains or complete nationwide coverage.

## Verification

- Matrix generation: PASS.
- Release register generation: PASS.
- Matrix validator: PASS; no duplicate full keys, all conflict groups excluded from endpoint runtime, eligible spans unique.
- Quote/API contracts: PASS.
- Full test/build: `npm run build -- --webpack`, 75/75 tests; Next webpack build and TypeScript PASS.
- Not performed: new Yandex checks, hosted POST/browser E2E, deployment, push, merge, Production.

## Workspace constraint

The previous `matrix-work` checkout is mounted read-only by the workspace and fails file writes with `EROFS`; changing file mode cannot remove a read-only mount. Work proceeded in a complete Git clone at `/workspace/scratch/806dbc1ef74b/matrix-audit-work`, which is inside the authorized writable root. The original mount remains untouched. The changes are saved to a local branch; they are not on the remote until separately published through the repository workflow.
