# Stage A — street acceptance LOCAL PASS, hosted/coverage PARTIAL

29.10.2026 MSK; source/parent `e6142b18f1d41dae25e43a0a859a36cd247cdb81`. Prior d7cc05f6/a0e27781 and all prepared work preserved. No push/Preview/CI/Production/main/Android/backup/merge/force operation. Published a1c169d3, PR14 Draft verified at start; new work remains LOCAL ONLY.

## Actual new bounded UI check

Flow: V3 AddressField → POST/r → city/street suggestion → selected point/other field preservation. The production build of e6142b18 was started locally on127.0.0.1:3194 with existing explicit local pilot flags only; no .env/Vercel setting or protection change. Next16.3.4 Ready147ms is local process readiness, not cloud cold-start latency.

`node /tmp/street-scope-browser.mjs`, Chromium154.0.8037.57 with browser sandbox enabled, desktop1280×900 and mobile390×844/touch, bothPASS:

- New street selection Krasnodar/Krasnaya: original source point, requested city, explicitly approximate street label.
- Unconfirmed DNR/Artyoma request: clearly selects **Донецк — ДНР**, not a falsely named street or Rostov coordinate.
- Clear A→Moscow preserving B; A↔B twice with refocus preserving complete selected values; clear B→Yalta preserving A. No page errors.
- Actual local city HTTP POST/r responses200/providerGeoNames. **Street responses were explicitly replayed in the browser** from the current handler outputs based on saved real Photon bodies. This is not a fully live street/browser/Photon run, nor Vercel acceptance. No external Photon requests or new route requests were made by this UI check.

Evidence `experiments/address-search/2026-10-29-street-scope/ui/`: original report, runner, stdout/server log and desktop/mobile screenshots. Screenshot visibly distinguishes a street in A from the truthful city-only B; selected text can truncate on mobile like existing fields, not a changed exact-house promise. No client component edit.

## Existing route proof reused, not re-executed

Prior actual A4 Moscow→SPb calculation at c962fb73:HTTP200/4229ms/711430m, retained in `2026-10-29-stage-a4-local/city-browser-review.json`. Current Moscow coordinate equals the archived actual browser input. `git diff --quiet a0e27781 -- app/v2/components/address-field.tsx app/v2/page.tsx app/v3 lib/route-input-validation.ts lib/route-providers.ts lib/v3-calculation app/api/v3/calculate data/local-settlements` exits0. Relevant route/client/corpus inputs unchanged; current endpoint tests preserve point format. This is reuse, NOT a fresh final-SHA route/Preview success. Old BRouter error and historical mobile-timeout cause remain independent; no new unsupported cause/price claim.

## Acceptance and remaining limits

- Twelve new regression tests; final focused93PASS/0FAIL/1SKIP, full offline1025PASS/0FAIL/1SKIP, quote/API checksPASS, TS/scoped lint/webpackPASS on this exact runtime. See preceding code checkpoint for commands, negatives and source SHA. No tests/build repeated after docs-only archival.
- All eight requested inputs covered by actual handler+admitted database and controlled replay; five bounded actual source requests preserved. Three city/street examples have actual source-backed points; DNR/Artyoma remains **UNCONFIRMED**, with explicit city-only fallback rather than invented coverage. Full municipal polygons are not independently certified for all streets; source association/region/coordinate consistency is the verified level.
- Independent free street reserve remains BLOCKED; city-level independence remains operational in the admitted Preview/local pilot. Houses stay OUT_OF_SCOPE, working detailed compatibility/tests retained.
- Ready for **separately authorized limited Preview publication/acceptance**, not an assertion that every functional blocker or all street coverage is closed. No new-source hosted check or cloud-resource measurement occurred.

Local Next process stopped and only the stage-created node_modules symlink removed; original dependencies/old worktrees retained. Read back preserved source/body hashes, document links and authored-source whitespace; raw logs retain original CR/spacing. Prepare a verified incremental local recovery bundle without any network write. A docs-only commit records this handoff. The next external step requires explicit push/automatic-CI/Preview authorization and exact new-deployment acceptance, not another broad audit.
