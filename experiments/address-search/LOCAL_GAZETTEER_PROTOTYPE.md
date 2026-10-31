# Free settlement search — measured offline prototype

28.10.2026 MSK. Research only, runtimeApproved=false. No app/lib integration, CI change, publication, paid API, account or mandatory subscription. Geoapify adapter unchanged; e231637/12e105e/d5c68b6 retained as ancestors.

## Architecture selection

| Option | Independent of runtime Photon | Cost/licence/resource facts | Decision |
|---|---|---|---|
| Own GeoNames settlement index | Yes; lookups have no network code | CC BY4.0, attribution/change notice; saved RU+UA sources already available; compiler needs ordinary offline CPU | Selected for prototype; data admission remains conditional |
| Own OSM place extract | Yes after offline import | ODbL/attribution/share-alike requirements; current Russia PBF3.9GB before filtering; needs extraction/update tooling | Alternative/supplement for labels/coordinate verification, no bulk download here |
| Photon-only | No | No per-call fee, public demo availability not guaranteed | Keep optional street/house/detail search; not a dependency for locally admitted settlements |
| Required hosted key-based provider | No local independence | Quota/account/service dependency even on free tier | Rejected as mandatory core. Geoapify experiment preserved but not activated |

Official references: [GeoNames dump/licence](https://download.geonames.org/export/dump/), [OSM licence](https://www.openstreetmap.org/copyright), [Geofabrik scope/size](https://download.geofabrik.de/russia.html), [Vercel limits](https://vercel.com/docs/functions/limitations), [Hobby terms/quotas](https://vercel.com/docs/plans/hobby).

## Real input and universal compiler

Recovered existing24Oct2026 GitHub artifacts12558568536/12559454564; outer and four inner ZIP SHA verified against existing manifests. No new GeoNames download, no repeat93-candidate/19-collision audit. This is a NEW full-index compilation, not a reclassification of the old sample. Sources are an immutable24Oct snapshot, not a claim of current complete2026 coverage.

local-gazetteer-build.py streams country files, keeps active P settlement types, excludes historical/abandoned/subdivision/group codes; joins CURRENT language-tagged ru aliases and administrative records. Original name/ASCII remain searchable. No guessed translations or synthetic coordinates. Same-name records retain GeoNames IDs, source dump+line/date, available admin codes/labels and quality flags. Source archive hashes are in catalog metadata. Unknown language/admin data remains marked. Historical alias flags and supplied from/to periods are respected; unsupported period syntax is conservatively excluded.

Source processing:458879country rows/237006P rows;15494excluded as inactive/subdivision/unsupported settlement types;1427089alias rows processed;221512active records compiled.456518normalized alias postings. No named-city branches in compiler/search; control names and explicit source crosswalks exist ONLY in tests/profiling.

Lookup uses a sorted alias prefix index, case/ё/hyphen/space normalization and retained spelling variants. It filters requested region words using available context; existing verified coordinate polygons classify DNR/LNR/Zaporizhzhia/Kherson and Crimea. Exact names precede prefix matches; four priority areas precede ordinary Russian/Crimean homonyms, then other source countries. All IDs retained; colliding labels get ID+source coordinate suffix, no automatic selection. At most10000postings scanned/50returned; hasMore/truncated exposed. A truncated prefix scan MUST NOT be presented as exhaustive or guaranteed globally prioritized output: prompt refinement or improve indexing before public use.

## Results on real records, no external API

| Query | Observed source result |
|---|---|
| Донецк | GeoNames709717(DNR) first,565348(Rostov) second;10matching records including prefixes |
| Донецк Ростовская область | Rostov city first;4context matches |
| Волноваха |689198,47.6008/37.49358, DNR;1match |
| Краснодар |542420 first;10matches including prefixes |
| Ялта Крым |688533, Crimea;1match |
| Луганск / Запорожье / Херсон | Corresponding priority region first;7/4/20matches |
| Тарасовка |75distinct matches; default20shown, no auto-choice |
| Unknown synthetic name |0results, no fallback coordinate invented |

Full evidence: local-gazetteer-evidence-2026-10-28/profile.json. Offline profiler replaced fetch with a throwing stub: lookups did not invoke a provider. These are actual GeoNames records, not mocked lookup answers. Unit tests separately use synthetic records.

Source POINT counts, not independently verified completeness: other-RU189037; Crimea1081; DNR1595; LNR1329; Zaporizhzhia1218; Kherson956; outside-priority-UA26296. Coverage was measured for this newly filtered index, not inferred from country codes or the old sample.

## Performance and Vercel feasibility

Node24.19.0, fresh process (OS disk cache NOT flushed), final search module SHA pinned in profile:

| Measurement | Observed |
|---|---:|
| JSON |42763328bytes (42.76MB) |
| gzip |7358514bytes (7.36MB) |
| Parse+index initialization |1795.61ms |
| Heap increase afterGC |217161240bytes (~207MiB) |
| Whole-process RSS |533204992bytes (~509MiB) |
|110search samples p50/p95 |0.60/2.54ms |
| Maximum (includes first geometry warm-up) |100.65ms |

Compiler initial run7.609s offline. Existing local Next /r dependency trace4638125bytes/105files/0missing; adding raw catalog yields roughly47.4MB before actual Next packaging. Documented ordinary Node function limit250MB and Hobby memory2GB make the measured design technically plausible. This is NOT an integrated Next bundle or Vercel cold-start measurement: actual packaging, combined app memory and concurrent cold initialization remain untested. Use one process-local lazy initialization promise, immutable bundled data and no per-request whole-index rebuild. Do not send the42MB catalog through a function response (documented4.5MB payload cap); return bounded suggestions. Optional static prefix shards could reduce function usage later, without mandatory API fees.

Hobby includes resource quotas and is restricted to personal/noncommercial use; a calculator being free to users does not establish that any commercial use is eligible. No plan/account change or new charge made. Unlimited free hosting is not promised. The local data/search code is portable and has no key-based billing dependency.

## Data-quality gates — not yet eligible for public integration

-25043records lack a CURRENT language-tagged ru name (not proof that no Russian spelling exists).31347have at least one unverified Russian admin label;524have missing admin binding. Regional breakdown in coverage.json: priority-region city-name gaps9DNR/12LNR/8Zaporizhzhia/6Kherson/10Crimea; most small-area admin labels there are not ru-verified. Do not publish guessed administrative translations. Showing verified region+explicit ID/coordinates can distinguish records but does not magically establish missing district labels/usability.
- Independent settlement coordinate accuracy is NOT certified. Existing retained OSM reference comparison (no new capture): Donetsk city point separation795m; Rostov Donetsk164m; Krasnodar1188m. Different settlement reference points are not automatically errors or proof of exactness. No tolerance was invented and no coordinate replaced. Source country/validWGS84/polygon membership alone do not prove correct locality position. Volnovakha source point still needs independent place-level corroboration before admission.
- No claim of all settlements/current administrative boundaries/complete aliases. Full-source active-type filter excludes some classes. No fuzzy/house/street search; aliases/prefix only. Very broad prefixes can hit the scan cap and must remain explicitly incomplete.
- Existing old BLOCKED_BY_DATA findings are NOT marked resolved. New prototype removes runtime network dependency technically; data admission and user-visible source attribution remain separate acceptance gates.

## Update without hand-editing thousands of records

Acquire trusted versioned RU/UA country and language archives at build/review time, never on a user query. Provide two manifests (both countries mandatory, exact official URLs/SHA), source date and local directories:

    python3 experiments/address-search/local-gazetteer-build.py --country-dir /path/country --alias-dir /path/aliases --country-manifest /path/country-manifest.json --alias-manifest /path/alias-manifest.json --source-date YYYY-MM-DD --output /path/catalog.json

Default manifests replay this saved24Oct source. Byte/row/output limits fail closed; atomic temp-file replacement retains last good compiled catalog on failure. Review release diffs (IDs/names/admin/coordinate changes, alias periods, counts), quality/cross-source evidence and hashes; only then ship an immutable version. A failed source update must not disable the previous approved local version. No schedule or CI has been changed. Before display, provide GeoNames link, CC BY4.0 link, source/review date and filtering/indexing change notice. This catalog uses GeoNames data; adding OSM-derived database content later requires separate licence handling.

Commands used:

    PYTHONDONTWRITEBYTECODE=1 python3 experiments/address-search/local-gazetteer-build-test.py
    node --import ./scripts/register-ts-paths.mjs --test --test-isolation=none experiments/address-search/local-gazetteer.test.mjs
    node --expose-gc --import ./scripts/register-ts-paths.mjs experiments/address-search/local-gazetteer-profile.mjs /tmp/local-gazetteer-prototype/catalog.json /tmp/local-gazetteer-prototype/profile.json

3Python integrity tests+6Node search testsPASS; scoped ESLint/diff-checkPASS. No full audit, app build or live browser run repeated for these unintegrated experiment files. DatasetSHA2562860aaeca95ff9b97f6778cbbaf64912b42e94ba47ceabc0bb409e4845d2b6f1; generated catalog is delivered in a local evidence bundle, not committed as a43MB runtime import.

Recommended next stage: refine a releasable corpus/label scheme with automated quality gates and independent point checks, then authorized Preview-only integration (local settlements first; Photon only for detail/misses). Keep runtime disabled until data, source attribution, actual deployed resource budget and ranking/ambiguity UX pass. No Geoapify key is a prerequisite for that path.
