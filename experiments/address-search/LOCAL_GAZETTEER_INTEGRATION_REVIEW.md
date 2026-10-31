# GeoNames integration review — 29.10.2026

Local-only continuation of a4b5cdf; no publication, CI, runtime API, Geoapify or Production changes.

## Data acceptance

The 15-name review and raw evidence are in `local-gazetteer-evidence-2026-10-28/admission-2026-10-29.json`. All requested cities exist. 221512 source settlement points remain available, including separate Donetsk IDs, variants and homonyms. PPL source classes avoid selecting ADM administrative-centroid records, but source class alone does not prove a routable point. Russian names and admin joins were inspected, not guessed from name equality.

Independent-source access was bounded: Wikipedia batch HTTP503/curl22, then Wikidata query by article IRIs HTTP200/zero rows; corrected exact GeoNames-ID query HTTP200/15rows. No Photon or routing API calls. Raw SPARQL query/response and computed separations are saved. P1566 explicitly links all15 city identities; reference coordinates differ by62m–4293m (Mariupol maximum). These are not automatically errors: representative city points differ. P625 statement references have NOT been reviewed, so independence from original GeoNames is not claimed. No invented distance tolerance or replacement point. Routing compatibility/road access remains untested.

The prior corpus gates remain meaningful, not artificial new requirements: unverified lower-admin Russian labels, ambiguous small-settlement identity and coordinate evidence. E.g. `Gorod Sevastopol` is selected from a source ru-tagged alias, proving a language tag does not guarantee a usable Russian display label. A release compiler should select/flag display scripts and retain structured verified region/district data; unknown lower-admin labels must not be silently declared verified. New cross-source linkage improves evidence for15 controls but does not validate the full221512-record corpus.

**Decision: runtime admission remains PARTIAL. Do not activate the new corpus in /api/suggest or /r yet.** This follows the user's condition “после подтверждения корректности данных”, not a need for paid APIs or renewed user permission to perform allowed local engineering. No claim of API/Preview outage resolution or A/B regressions on the new data.

## Implemented independent optimization

`local-gazetteer-shards.mjs` reuses the existing search/ranking unchanged. It partitions records by normalized first3 alias characters, stores gzip content-addressed immutable files and carries source/version/licence metadata. A query loads only its shard. One resident index, one serialized load queue (max16), shared warm loads, cancellation checks, gzip raw-size cap32MiB, SHA/length validation, no user-supplied file paths. No whole database in browser or per-query full-index rebuild. Missing/corrupt data rejects explicitly; it never creates coordinates or invokes a provider. Loader is experimental and not imported by app/lib.

Actual source result:8383prefix entries,7477unique gzip files+manifest; total on-disk22819654bytes, manifest1753599bytes, largest inflated shard1527964bytes. Compiler replays the existing catalog; source compiler and manifests remain unchanged. Shards total compressed21.84MB when counting duplicate references, actual unique directory22.82MB including manifest. More disk than the single7.36MBgzip, substantially less runtime working set. Generated data is in a portable local artifact, not thousands of Git source files.

Node24.19.0, fresh process (OS cache not flushed),18queries/10warm repetitions:

| Measurement | Result |
| --- | ---: |
| Manifest load |14.72ms |
| First `Доне` load+lookup |93.41ms |
| First `Волноваха` load+lookup |10.36ms |
| Warm overall p50 / p95 |0.27ms /145.75ms |
| Broad `Нов` first lookup |245.45ms |
| Peak observed post-GC heap delta |16698544bytes (~15.9MiB) |
| Peak observed RSS |177119232bytes (~168.9MiB) |
| External calls |0 |

Baseline full-index experiment: heap+217161240bytes (~207MiB), RSS533204992bytes, init1795.61ms. This is not a paired same-run statistical benchmark or integrated Next memory measurement; compare architecture feasibility only. Broad-prefix geometry/ranking remains the slow case; no runtime business-rule change made for speed. Observed RSS is not an instantaneous allocation high-water mark. Single-shard cache can reload on alternating prefixes; benchmarks include different cities, not only repeated one-city warm hits. Very broad original10k scan cap remains explicitly truncated rather than promising exhaustive priority.

## Verification and remaining work

19real query comparisons (including `Доне`, all requested cities, homonyms, broad prefix, absent name) returned byte-equivalent item structures/order to original search; all completed with fetch throwing,0external calls. This proves the ISOLATED module remains independent during provider outage, not that production API uses it. Four deterministic loader tests cover cache sharing, integrity failure/recovery, cancellation/no stale response, path validation and bounded queue. Three new admission tests separately PASS. Full routing audit/B03/B10 not repeated.

Requested production build was attempted directly, never `pnpm build`/test:audit. Default sandbox failed on Turbopack CSS worker creation/port bind EPERM. One changed-condition retry with the documented network permission failed with the same EPERM. Stop unchanged retries; do not modify app or CI to disguise environment failure. TypeScript was run independently; logs/status evidence in the checkpoint. Combined Next+catalog packaging/memory remains UNMEASURED because no data admission/integration and no successful new build. Do not substitute an old NFT trace for this build.

Next steps, in order: inspect typed ru display alternatives/admin bindings and cross-source coordinate claim provenance without inventing translations or rerunning old collision audits; define a reproducible eligible corpus and honest settlement-point precision; only then attach single process-global loader to server API (local settlements first, Photon for street/house detail), retain response shape/priority/cancellation/cache semantics; focused actual API outage tests and Next resource measurement. Preview publication requires separate permission; public runtime activation not performed here. GeoNames/CC BY4.0 visible attribution remains mandatory at activation; existing metadata/source dates retained. No mandatory paid service or API key is needed for this architecture.

## Subsequent completed local block: Russian source-display correction

The display issue above was corrected generically in the offline compiler, not deferred wholesale: prefer an EXISTING Cyrillic ru alias; retain romanized aliases for search; flag unavailable Cyrillic labels rather than invent translation. Real source example admin694422 has both aliases9066179(`Gorod Sevastopol`) and16719546(`Город Севастополь`). Three regression helper tests PASS; three manifest tests PASS; all-row comparison proves unchanged221512IDs/coordinates/types/admin codes/provenance,3048improvedtitles/4701admin-label arrays.1462additional names honestly marked unverified (total26505), not silently treated as validated. Lower-admin unknown labels still remain, notably Donetsk/Volnovakha districts/communities; not fixed by this script selection alone.

Corrected catalog SHA64b0af909e526c11e961da65106152ec4ed40511bcbfa8c5d998f759c4428c56; regenerated shard manifestSHAfa9375c8923b82356558a603f1b600629d919259e5ff59c942618ce535eba2cc. New parity19/19PASS/0externalcalls. New measurements are in `display-shards-profile-2026-10-29.json`: manifest13.24ms; firstДоне79.11ms/Волноваха15.62ms; warm p50 .29ms/p95139.98ms including broadНов; observedRSS180416512bytes (~172.1MiB), postGC heapdelta17313232bytes (~16.5MiB). Largest inflated shard1533015bytes. Historical table above refers to pre-display-fix input, not this corrected dataset. This is still an isolated module, not a successful integration/build/Preview check. Full corrected catalog and generated shards are kept in the local handoff archive; no remote publication.
