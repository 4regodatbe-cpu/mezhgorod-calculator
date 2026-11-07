# B05.5/B05.6 — single-origin failure and independent fallback admission

28.10.2026 MSK. Remote fc83523d9a9bcb75eff6a715e73d2f25dd75e6d7, PR14 Draft; local e231637 preserved. LOCAL checkpoint only; publication prohibited.

## B05.5 — established mechanism, unresolved transport root

Actual chain: AddressField→POST/r→suggestGET→collectAddressFeatures→process-local pool→fetchPhotonFeatures→https://photon.komoot.io/api/. URL generation for Donetsk, Volnovakha and Krasnodar mechanically checked:7 variants, exactly ONE origin each. Variants vary country/bbox/name, not service. sourceCount is variant count, not independent-provider count. Configured independent geocoders:0. Physical Photon instances behind DNS/load balancing are unknown; neither7 nor2 proves their number. Retry uses the same URL and does not guarantee another instance.

Pool concurrency2, queue64, global query budget20s, source cooldown15s after3HTTP429/503; cooldown keyed by origin. Since every variant uses the same origin, circuit opening can reject all remaining variants without making their network requests. This can omit an available homonym but is not evidence that its specific region URL failed: existing logs aggregate failures and discard URL identity.

Saved real Preview primary evidence: 20address calls (4initial200,16replacement/retry502), two calculation200; all new city failures ~20002ms/budget7. Separate earlier production incident labels connect_timeout2/budget5; hosted Donetsk CHECK_FAILED retained20features,503x3/cooldownx3, DNRfirst/Rostov-secondfalse. App returns502 when all variants reject. Missing provider records and broken client clearing are disproved as general explanations by saved positive captures and real clear/preservation tests.

Calculation success does not establish geocoder health: selected coordinates are already supplied. Existing cached URL responses can also survive partial upstream outage; fresh city queries need fresh upstream. Codex uses its configured sidecar HTTPS proxy; app code supplies no explicit proxy transport. Vercel actual logs identify preview regioncle1, whereas source requestsfra1; this observation alone does not identify routing policy. Different egress/DNS/cache/instance selection is plausible but unproved. No provider-side request trace, failed-response headers/body, resolved remote address, phase duration or Vercel egress rejection is retained. Cannot claim Vercel ban, Photon rate-limit ban, IPv6 issue, or exact infrastructure fault as established.

Photon official README https://github.com/komoot/photon#demo-server confirms public demo, possible throttling/bans under extensive usage and no availability guarantee. This establishes service limitations, NOT the cause of these specific503s. No further Photon live requests were needed/repeated for this block.

## B05.6 — existing fallback recovery

Existing experiments/address-search/geoapify-fallback-experiment.mjs: isolated/defaultdisabled, one city request, max5candidates/2s, requires key and confirmed primary outage, returns unreviewed candidates/publicUseApprovedfalse. No imports by app/lib. Branch-scoped Vercel environment metadata queried decrypt=false: no GEOAPIFY/DADATA/PHOTON variables; process likewise has no Geoapify/DaData key. No values exposed or accounts created.

Existing official source review EXPERIMENT11_SOURCES.md remains authoritative; no repeat three-provider survey: public Nominatim forbids autocomplete and is not a lawful drop-in; DaData remains credential/coverage/coordinate-review blocked. Geoapify is operationally separate from Photon but shares OSM data and needs actual regional capture, attribution and quota controls. Current official API docs https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/ read; do not infer regional correctness or SLA from documentation. Snapshot remains disabled/limited and is not independent service continuity. Previously proxy-denied komoot.de alias was not retried or admitted as a separate service.

BLOCKED_BY_CREDENTIALS/DATA: need owner-provisioned scoped Geoapify key through normal secret workflow (not chat), permission to use its free quota and provider attribution, then4bounded city captures in real Preview. No paid plan/service activation allowed. B05.7 runtime integration is conditional on successful admission; no basis yet to enable public fallback.

Next independent work: prepare review-only normalization reusing current ranking, exact20s budget plan and bounded4-query server acceptance recipe. This is preparation, not a claim that independent fallback works in Vercel. Do not publish or repeat already failing live calls in unchanged conditions.
