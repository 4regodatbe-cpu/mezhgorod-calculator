# GeoNames → actual V3 API: local pilot result, 29.10.2026

This continues d044b07, not a new audit. No push, CI, Production/main/Android/backup changes. Prior local commits preserved. The module is OFF by default; no public outage resolution is claimed.

## Corpus admission

All221512source rows validated automatically: IDs, duplicate IDs, field types/bounds, coordinates, source types, names/aliases/control characters, administrative structures and original provenance. No malformed coordinates/duplicate IDs found.26505unverified ru names and431missing administrative bindings are quarantined.194576structural candidates are NOT a full semantic accuracy certificate. A further25145outside requested geography/unverified administrative display/ambiguous-territory records are excluded.169431records admitted ONLY for explicit local pilot. In priority regions omit unverified lower-admin labels rather than invent translations; show region from existing verified polygons. GeoNames IDs, source points/lines/dates and retained aliases are not overwritten. Same-name records remain separate. Source snapshot24Oct2026, not guaranteed current completeness.

15controls retain saved explicit GeoNames-ID→Wikidata links/coordinate comparisons. New OSRM nearest15/15HTTP200/Ok; road point distances0.40–83.08m. This confirms nearby road graph access for those controls, not exact addresses/all-corpus truth/complete route/real-world travel safety. Raw responses+SHA retained. No city-specific runtime lookup branch or new paid API.

## Actual API integration

`lib/local-settlement-search.ts` is called first by existing `app/api/suggest/route.ts`. V3's existing POST `/r` forwards unchanged. Opt-in server-only variables:

    GEONAMES_LOCAL_PILOT=1
    GEONAMES_LOCAL_PILOT_DIR=/absolute/path/to/pilot-shards

Without both, prior public Photon behavior remains. A generated admission receipt pins manifest SHA; shards verify SHA/size, one resident shard, queue16, process-global initialization promise, cancellation checks. Queries with street/house markers/digits/comma bypass local search; absent city matches can still reach Photon. No client corpus download or AddressField change. Output remains compatible id/title/label/region/position plus source/date/licence/precision metadata. GeoNames points are settlement centres, not house precision. Source attribution in metadata is NOT sufficient public visible attribution; add it before enabling a public release.

Rebuild/replay:

    node --import ./scripts/register-ts-paths.mjs experiments/address-search/local-gazetteer-pilot-build.mjs /path/display-catalog.json /path/pilot-shards /path/pilot-review.json
    GEONAMES_TEST_DIR=/path/pilot-shards node --import ./scripts/register-ts-paths.mjs --test --test-isolation=none scripts/local-settlement-api.test.ts

The saved corrected catalog SHA is64b0af909e526c11e961da65106152ec4ed40511bcbfa8c5d998f759c4428c56. Existing source compiler/manifests regenerate it offline from official archived RU+UA data; no new GeoNames downloads. All corpus issues/reasons/IDs remain in evidence. Generated data is delivered as a portable local archive, not falsely claimed present in GitHub.

## Evidence by layer

| Boundary | Actual result |
| --- | --- |
| Full source structural validation |221512scanned;3regression testsPASS |
| Real API with external fetch forbidden |17cityqueries, actual GET and POST/r forwardingPASS,0externalcalls |
| Selection → router input |validPoint and geocode preserve actual positions without networkPASS |
| Mixed city/street query |reaches controlled Photon responsePASS; no claim of live Photon availability |
| Real production browser |Chromium154 sandbox enabled; desktop/mobile new GeoNames select/clearA/B/other-field preservationPASS; no address mocks |
| Next production build |Next16.3.4 `next build --webpack`+TypeScriptPASS/exit0, Node24.19.0 |
| Default Turbopack |CSS-worker/port-bindEPERM even with standard escalation; not relabelled as PASS |
| One real YaltaCrimea→SPb route |HTTP502in5869ms;0legs; provider Valhalla/OSRM/BRouter stages failed, no retry |

The route failure occurred AFTER successful geocoding (0errors). Input-contract compatibility and nearby road graph access do not imply successful full route calculation. Provider-stage telemetry does not reveal underlying connection/HTTP failure; don't invent a network-ban/root-cause explanation or change route logic to make this pass. Full route acceptance remains BLOCKED by this observed provider failure until checked in a suitable permitted environment. No mass audit.

Browser initial fixture count>=7 failed because Volnovakha re-selection correctly uses client cache; failure retained. Fixed the fixture to require every distinct real query/provider/status and wait for response evidence, rather than inventing per-click network counts. Final desktop+mobilePASS. Routing was intentionally not mocked into a successful calculation; real route failure is separately preserved. No client bug was concealed.

## Measured performance, not estimates disguised as deployed success

- Node fresh actual handler process: imports284.66ms; firstДоне106.61ms/Волноваха16.01ms;35warm handler samplesp953.19ms; Next-handler+dataRSS136.22MB, database heapdelta16.36MB. Not a listening server measurement.
- Actual `next start` production server ready149ms;35warm HTTP round trips including curl process p9536.91ms; afterRSS168336KiB (~164.4MiB), processHWM211760KiB (~206.8MiB). Cold first HTTP query not independently timed.
- New pilot data6219files/18036230bytes. Actual NFT traces117unique files/7455381bytes/0missing. Pilot files are external to trace;25.49MB combined arithmetic is NOT a self-contained deployable artifact. Do not deploy without deliberate immutable data inclusion/tracing.
- Current Vercel account plan/quotas not inspected; previously documented250MB ordinary bundle/2GB Hobby memory limits suggest feasibility, not certification. Free-to-user does not imply commercial Hobby eligibility/unlimited free resources. No account/subscription/paid key created.

## Task status and next executable work

Original task blocks1/2/3/6 are completed for this LOCAL-PILOT scope (validation/admission of restricted corpus; supported build path; real API integration; local persistence). Block4 is PARTIAL: UI/search/input checksPASS, full routeFAIL. Block5 PARTIAL: real warm server/handler memory and timing measured; cold HTTP, self-contained packaging and actual Vercel plan constraints remain unverified. This is4completed/2partial, not100% acceptance/public readiness.

Next independent work: package immutable pilot data into a traceable server artifact and add visible GeoNames/CC BY4.0 attribution; keep opt-in/defaultoff; then repeat ONLY the necessary packaging build/cold-server test, not old audits. Preview publication and any push require separate permission. One-route failure must be investigated from richer permitted provider evidence or suitable runner, not retried unchanged here. No full offline gate result claimed for newly changed source (only focused tests/TS/lint/build). Checkpoints under docs/checkpoints are append-only journal per WORKFLOW_RULES; denied historical WORK_LOG/NEXT_STEPS untouched.
