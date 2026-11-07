# Address resilience — bounded connect retry

Status: LOCAL PASS / REMOTE PENDING AUTHORIZATION. 28.10.2026 MSK.
Source: 8fb4d137308450affc984de272adebbfd67d0851, permitted branch fix/v3-missing-route-prices-2026-10-15, PR14 Draft.

## Change

lib/photon-fetch.ts retries UND_ERR_CONNECT_TIMEOUT exactly once using the same AbortController and original 20s deadline. HTTP errors, invalid bodies, empty results and cancellation do not trigger retries. Existing query-level budget, pool concurrency2, singleflight, cache, circuit breaker, ranking and cancellation remain intact. A fresh transport attempt may select another reachable backend/address but does NOT guarantee another Photon instance. There is no configured independent Photon endpoint in current source. A bounded probe of photon.komoot.de was rejected by the network proxy with CONNECT403; it is not added as a fallback.

No hard-coded cities, snapshot activation, route/tariff/UI/workflow changes. At most two transport attempts per unique pool task; persistent connection failures can therefore increase upstream load, still bounded by existing shared query deadline. A complete Photon outage remains a 502; independent-provider continuity is NOT solved.

## Verification

- Regression first: new photon-fetch tests failed against original implementation (exit1).
- After fix: photon-fetch 10/10 subtests PASS with test-isolation=none; four are new tests for transient recovery, bounded full failure, cancellation before retry and noncooperative retry bounded by original deadline.
- New address-connect-recovery endpoint test 1/1 PASS: first connection to each URL fails, second succeeds, proxy returns200, DNR precedes Rostov, exactly7 URLs/two attempts each.
- Existing pool/endpoint/proxy plus modified fetch:4/4 file-level tests PASS. Existing tests cover shared cancellation, queue cleanup, overall budget and partial/full outages; no mobile/browser claim.
- TypeScript and scoped ESLint PASS, exit0. git diff --check PASS.
- Node24.19.0 direct Next production build PASS, exit0; compilation9.6s, TS13.2s. Initial build with reused external node_modules symlink failed due Turbopack filesystem-root restriction; copying dependencies into this isolated worktree resolved it without changing project config. preferredRegion deprecation warning retained.
- npm run test:audit was rejected BEFORE execution by automatic approval review: wide tariff/road audit outside allowed scope. Not rerun by another mechanism.

## Remaining acceptance and publication

Client code unchanged. Current browser connector has navigation/read/screenshot but no interaction; no new clear-A/B, ten replacements, mobile or Preview verification. Existing B03 acceptance is not claimed as new evidence. No further live address series can prove the unpublished patch in Production.

Publishing this runtime change triggers special-territory-policy live_probe and calculation_timing under existing classifier. Standing instruction forbids another broad live audit. Do not weaken classifier or use alternate transport to bypass approval. Explicit authorization for one ordinary PR update and its broad jobs is needed before publication. Keep local commit/portable patch; remote HEAD remains source SHA until separately verified publication. No Production/main/Android/backup changes.

Next: obtain authorization for normal CI publication, publish with expected parent lease, inspect required gates and live artifacts, then verify Preview/mobile full user flow. Until then B05.1/B05.2 locally verified, B05.3/B05.4 incomplete.
