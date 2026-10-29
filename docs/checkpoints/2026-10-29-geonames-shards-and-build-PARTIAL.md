# GeoNames bounded loading and build evidence — PARTIAL, local only

29.10.2026 МСК; parent778204f; runtime/remote fc83523d9a9bcb75eff6a715e73d2f25dd75e6d7, PR14Draft. No push or CI events. Prior local commits retained.

Implemented isolated compile/load module `experiments/address-search/local-gazetteer-shards.mjs`, deterministic tests, real parity/profile scripts. Existing search algorithm reused, no ranking/coordinate replacement.8383prefix entries;7477unique compressed files+manifest22.82MB; maxinflated1.53MB. Only one resident shard; serialized bounded queue16, cache sharing, SHA/length/gzip cap, cancellation. No runtime app/lib imports of this experiment. Sources/version/GeoNames CC BY4.0 metadata preserved. Generated artifacts remain outside Git source tree.

Actual Node24.19.0 measurements and limitations in `LOCAL_GAZETTEER_INTEGRATION_REVIEW.md`; raw profile/parity under `local-gazetteer-evidence-2026-10-28/`. Manifest14.72ms; firstДоне93.41ms/Волноваха10.36ms; warm p50 .27ms/p95 145.75ms (includes broadНов); postGC heap delta16.70MB, observedRSS177.12MB. Not integrated Next memory/cold-start or instantaneous allocation peak.19real query parity cases PASS/0fetch calls under provider-throwing stub. Four loader tests PASS; three admission tests PASS; existing six search tests retained.

Additional bounded coordinate source evidence: Wikipedia batch503/curl22; Wikidata article-IRI query200/zero rows; corrected explicit15GeoNames-ID SPARQL query200/curl0/15linked records. Raw query/response and comparison retained. City-point differences62m–4293m; source claim provenance/road access not certified; no arbitrary tolerance/new points. This improves identity evidence, not approval of every point/admin label. Existing all-row data gate remains PARTIAL; API integration deliberately NOT activated before correctness admission.

Commands:
- `node --import ./scripts/register-ts-paths.mjs --test --test-isolation=none experiments/address-search/local-gazetteer-shards.test.mjs`:4PASS.
- `node --import ./scripts/register-ts-paths.mjs experiments/address-search/local-gazetteer-shards.mjs /tmp/local-gazetteer-review/catalog.json /tmp/local-gazetteer-review/shards`:compilePASS.
- `node --expose-gc --import ./scripts/register-ts-paths.mjs experiments/address-search/local-gazetteer-shards-profile.mjs ...`:18realqueries/0network.
- `node --import ./scripts/register-ts-paths.mjs experiments/address-search/local-gazetteer-shards-parity.mjs ...`:19PASS.
- scopedESLint/diffcheckPASS; `node_modules/.bin/tsc --noEmit`:exit0.
- direct`node_modules/.bin/next build`:exit1, Turbopack globals.css/process creation/portbind EPERM. Changed-condition retry with supported network.enabled permission:exit1/sameEPERM. Logs saved beside evidence; no more unchanged retries. No `pnpm build`, test:audit or live audit.

Next: resolve source-backed Russian display/admin and coordinate-reference provenance, then eligible corpus/API integration/actual local endpoint outage checks and combined Next memory. New dataset not sent to browser or deployed. User requires separate Preview publication permission. Historical denied WORK_LOG/NEXT_STEPS untouched; this checkpoint is the new append-only journal. Local-only persistence explicitly requested, not remote-saved work.
