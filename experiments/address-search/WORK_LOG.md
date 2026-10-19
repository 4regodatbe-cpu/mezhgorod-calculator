# Address search work log

## 2026-10-19 — point-B search latency

- Request: user reports that the calculator does not find the destination address (point B).
- Source: on authorized branch `fix/v3-missing-route-prices-2026-10-15`, PR #14 draft, source head `2ddc6112c3c2f7ad802485408d765449268e8a6b`.
- Diagnosis: A and B share `app/v2/components/address-field.tsx` and `/api/suggest`; the API fans out to all Photon URLs with `Promise.allSettled`, without a deadline or propagation of the browser's abort signal. Published API probe for «Краснодар» returned suggestions but took 8.224717 s; direct Photon took 6.779325 s. The exact destination reported by the user was not provided, so an address-specific miss was not reproduced.
- Changed locally: `lib/photon-fetch.ts` adds a 10 s hard timeout, aborts upstream work when the browser cancels, preserves the 300 s Next fetch revalidation, and validates Photon JSON. `app/api/suggest/route.ts` uses the helper while retaining partial-result behavior. `scripts/photon-fetch.test.ts` covers successful results, timeout, caller cancellation, and HTTP 503.
- Checks: `pnpm install --frozen-lockfile` succeeded; `node --import ./scripts/register-ts-paths.mjs --test scripts/photon-fetch.test.ts scripts/address-search.test.ts` passed 39/39; targeted ESLint passed after a first invocation found an unused import/prefer-const issue that was corrected. `pnpm exec tsc --noEmit` was attempted and failed because sparse checkout omits existing `experiments/nationwide-tolls/source-snapshots/zsd/*.json` imported by unchanged calculator modules. Full audit/build and new CI were not run.
- Save status: local branch only. Automated approval review rejected the public GitHub push as unapproved external publication; no connector or alternate remote-write path was attempted. No remote code commit, CI run, merge, or Production deployment was made. Production remains unchanged.
- Next: after explicit authorization for the GitHub write, verify the remote head is still the source commit (or safely reconcile), save this patch and checkpoint to the authorized branch, then run required full gates and inspect CI. A deployed fix still requires a direct production-publish request. Ask the user for the exact point-B address if the failure persists after the bounded change is deployed.

### Local persistence correction — 19.10.2026 22:02 МСК

The initial STARTED record is local commit `6a69402`; the source/test/BLOCKED package is local commit `75dc258c0e8355995d1b264720043394399876c8`. The automatic review rejected the attempted remote push, so the origin branch remains at the prior source commit to our last remote read (`2ddc6112c3c2f7ad802485408d765449268e8a6b`). No remote readback of the local commits, CI, or production deployment occurred. Local commits preserve the work in this workspace but do not meet the project's durable remote-save requirement.

## 2026-10-19 — repeat-query speed cache

- User asked whether address search can be accelerated. A repeat published API request returned in 9.202622 s; an immediate repeat returned in 6.373840 s. Both returned 20 suggestions. The variation does not isolate caching or provider/network effects, and Photon itself remains the dominant unverified latency source.
- Added a browser-side normalized LRU cache shared by the A/B fields: non-empty results are reused for five minutes, at most 128 query keys. Empty results are not cached. New files: `lib/address-suggestion-cache.ts`, `scripts/address-suggestion-cache.test.ts`; integration in `app/v2/components/address-field.tsx`.
- Validation: combined focused suite passed 42/42; targeted ESLint passed. No full build, full audit, remote update, CI or Production release.
- First lookup remains externally bounded by Photon and is not claimed faster. Remote branch writing remains blocked by the previously recorded automatic review rejection.
