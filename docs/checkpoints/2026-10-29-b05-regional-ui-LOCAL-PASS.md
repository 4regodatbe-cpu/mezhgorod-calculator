# B05 — built local V3 desktop/mobile flow PASS; Preview AUTH BLOCKED

Source 3b08ca23ce3f603628dd4ebc0425c62b7206c7b2; runtime files matched HEAD with empty Git diff. Built runtime hashes, screenshots and raw browser results are in `experiments/address-search/2026-10-29-regional-browser-evidence/`, with SHA256 in source.json. These are LOCAL results, not results of published d5be.

## User story and actual flow

User selects settlement → AddressField sends POST /r → actual local Next API loads admitted GeoNames → actual response renders/selects, with the opposite endpoint preserved. Existing local integration harness was used, not the closed B03 mocked suite.

Commands:

```
GEONAMES_LOCAL_PILOT=1 GEONAMES_LOCAL_TEST=1 node_modules/.bin/next start --hostname 127.0.0.1 --port 3179
node experiments/address-search/local-gazetteer-browser.mjs http://127.0.0.1:3179 /tmp/b05-regions-browser
```

Node24.19.0, Next16.3.4 webpack production build, Chromium154.0.8037.57. Server Ready153ms is startup readiness, NOT Vercel cold-function timing or memory measurement.

Both 1280×900 and 390×844 PASS, exit0. Actual GeoNames-backed searches: Ялта Крым, Санкт-Петербург, Волноваха, Доне (ДНР selection), Донецк Ростовская область. Clear A → search/select twice → preserve B; clear B → Volnovakha → preserve A; repeat selection can use the client cache. All recorded search responses HTTP200/localSource geonames, no browser page errors. Mobile screenshot inspected; selected endpoints and GeoNames attribution visible. No address responses mocked. Browser third-party requests were blocked; calculation endpoint intentionally intercepted to avoid extra routing calls. Therefore this is NOT a full-route or Photon street live test. Those backend source/format/route-coordinate guards were checked separately in targeted tests.

## Existing protected Preview

No new login link or login attempt. Existing device flow was polled; CLI whoami remains loggedIn:false (exit1, also with standard Node proxy opt-in). The CLI update-check worker separately reports npm dist-tags fetch failure; that alone does not establish why user authorization has not persisted. Existing Opera Preview tab was navigated once to the exact existing Preview; it still redirects to Vercel login. No unrelated tabs/cookies touched, no share URL, token extraction or protection change.

Consequently real hosted city searches, hosted Photon failure behavior, live full-route calculation, hosted resource measurements and new local behavior in Preview are UNVERIFIED. Existing published Preview is d5be; new fixes are not published. Next: complete the existing official CLI authorization in this environment and verify whoami/project, then exact protected Preview via vercel curl/development OIDC. Publication of these local commits requires separate owner permission; no automatic push/CI/live jobs initiated.

All previous local commits retained. This checkpoint replaces neither historical WORK_LOG nor NEXT_STEPS; those protected files remain untouched under the checkpoint-first rule.
