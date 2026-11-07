# Block12 / B01 AUD-GEOCODE-01 — DONE

Parent fcfcddf4d9e0a62bf0d67ff1711e6d04c4873c29; allowed branch; PR14 Draft. Added25s AbortSignal to direct geocode; fetch/body timeout maps to existing GEOCODE_UNAVAILABLE, other exceptions retain prior handling. First-feature ranking, labels and supplied coordinates unchanged.

Test-first RED: stalled-fetch regression failed because signal absent. GREEN: scripts/geocode-deadline.test.ts2/2 (controlled abort, first-feature selection and bypass), npx tsc --noEmit, scoped ESLint, git diff --check PASS. No live calls; full build/hosted CI not run, broad audit not repeated. Code:lib/route-providers.ts; regression:scripts/geocode-deadline.test.ts. Technical3/24; B01 remains partial because general verified outage source missing. Next19/B10 saved Eisk attribution. Persist via non-force push and readback before next block.
