# 2026-10-31 — V3 Production release authorization and GeoNames opt-in

Status: IN PROGRESS — no Production deployment or domain switch has been performed by this work block as of creation.

Owner approved release of the current RC1 as a usable Production calculator. Interface changes are deferred. Scope excludes main, merge of Draft PR #14, Android and tariff/route algorithm changes.

Preflight findings:
- Accepted Preview RC1 commit: cde74243c88cfab313913d8b0435e8d56fae372e, deployed READY on Vercel. User accepted real route tests on phone.
- Existing Production baseline deployment: dpl_6XMRbMu5V5vqWTzf684oPTMyubju (GitHub 051d51ea4e4e40b21245af4f7e21b2fea4c4f00f), ready and rollback candidate; public project domain mezhgorod-calculator.vercel.app.
- lib/local-settlement-search.ts previously permitted GEONAMES_LOCAL_PILOT only in Preview on the approved branch; a direct promotion of old RC1 would silently lose the verified independent city search. Production Vercel variables did not include a GeoNames enable switch. This is a P1 release blocker.

Minimal release compatibility change:
- lib/local-settlement-search.ts retains global GEONAMES_LOCAL_PILOT==='1' gate, preserves exact preview branch requirement and default OFF; Production now requires independent GEONAMES_PRODUCTION_ENABLED==='1' as well. No routing, toll matrix, rendering, UI, data admission or geocoding ranking changes.
- scripts/geonames-production-gate.test.ts tests Production default OFF, dual explicit flags, Preview branch requirement and other environment denial.
- Production Vercel must receive both GEONAMES_LOCAL_PILOT=1 and GEONAMES_PRODUCTION_ENABLED=1, scoped ONLY to Production. Do not activate V3_TOLL_ESTIMATE or addressCitySnapshot; they remain OFF.

Release sequence: verify latest branch/PR, mandatory CI and Vercel build, set only two production-scoped flags, deploy exact reviewed HEAD with Production environment, verify READY/production domain and actual HTTP /v3 + /api/suggest city coverage including Mariupol, Melitopol, Donetsk, and Anapa. Only then mark DONE. If API behaves incorrectly, restore previous production deployment/aliases via the supported rollback mechanism; do not claim success without inspecting production output.

No private tokens, protected preview bypass values, or secrets should be committed or logged. Outstanding separate local-only postpublication Codex checkpoint 06c17540 remains outside the remote branch; do not overwrite it.
