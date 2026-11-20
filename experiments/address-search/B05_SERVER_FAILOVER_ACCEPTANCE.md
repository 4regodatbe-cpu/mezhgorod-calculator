# B05.7/B05.8 — minimal independent fallback admission

28.10.2026. LOCAL preparation, not public integration or passed server acceptance.
Remote fc83523d; e231637 partial-cache correction remains local and preserved.

## Minimal architecture, conditional on admission

Keep AddressField→/r→suggest contract, existing Photon query generation/ranker and20s absolute deadline. Independent candidate is api.geoapify.com, not another country/bbox URL on Photon. Reuse the existing disabled research adapter; no paid account or provider activation performed.

With configured/approved fallback: reserve at most2s inside the existing deadline; Photon receives remaining-minus-reserve (18s at a fresh20s request). On a confirmed full primary outage, cancel/drain primary subscribers and call fallback once using the SAME absolute deadline. No automatic retry, parallel speculative billing or deadline reset. Without credentials/enablement, keep the original primary time allocation. Empty/partial successful primary results keep the existing no-fallback policy; this does not solve partial homonym coverage. e231637 avoids retaining incomplete client lists, separately pending publication.

Private compatibility mapping reuses current rankPhotonFeatures and verified territory polygons. Geoapify IDs remain geoapify-* identities, never fabricated R-/N-/W- OSM IDs. Candidate bounds/admin-label/precision validation is NOT proof of actual coordinate correctness: review outputs retain coordinateAuthenticityVerified=false and administrativeConsistencyVerified=false. Source rows, attribution and provider precision must be independently reviewed before a public adapter is admitted. Do not mix unreviewed candidates into API items. No highway, tariff or routing change.

## Implemented research helpers

- fallback-admission-review.mjs: budget plan, review-only normalization, four-call admission runner. Requires explicit enablement and supplied key. Default disabled. At most4research attempts/2s each/10s shared;429 stops immediately. No app/lib imports this module. Runner labels primary outage as INJECTED, not an observed production failover. Existing research adapter provides cancellation/body-deadline behavior; it is still not production-ready (bounded byte streaming and distributed quota enforcement remain admission requirements).
- fallback-admission-review.test.mjs:6/6PASS, scoped ESLintPASS. Tests cover20s/remaining budget, unchanged full primary budget when disabled, distinct Donetsk identities/ordering using existing polygons, invalid coordinates/admin/precision rejection, zero requests without credentials, bounded four-attempt review and quota stop. Fixtures are synthetic; no new coordinate admitted.
- Actual no-key dry run: enabled=true, apiKey=process.env.GEOAPIFY_API_KEY → BLOCKED_NO_CREDENTIALS, reviewAttempts0, rows[], executionEnvironment=local, publicUseApproved=false. No live Geoapify calls and no real fallback correctness claim.

Commands (no credentials embedded):

    node --import ./scripts/register-ts-paths.mjs --test --test-isolation=none experiments/address-search/fallback-admission-review.test.mjs
    node --import ./scripts/register-ts-paths.mjs --input-type=module -e 'import {runFallbackAdmissionReview} from "./experiments/address-search/fallback-admission-review.mjs"; console.log(JSON.stringify(await runFallbackAdmissionReview({enabled:true,apiKey:process.env.GEOAPIFY_API_KEY})));'

Do not run the second command with a real key until provider usage/source review is authorized. It returns review data, never a successful public fallback.

## Real Preview acceptance — currently BLOCKED

1. Provision a scoped Geoapify key through the normal secret workflow for this branch's Preview only; approve free-quota use/attribution. No secret in chat, source, output or URLs retained in logs. No new subscription/account purchase. Current branch-scoped Vercel metadata decrypt=false has no expected provider variables.
2. Obtain separate authorization to publish the reviewed Preview-only diagnostic/integration changes and necessary normal CI. No publish, deployment or new share link is authorized in this block. Keep Production and existing CI unchanged.
3. Use the exact deployed source SHA, record VERCEL_ENV=preview, actual function region, Node, origin and sanitized per-attempt phase/outcome. Record connect/headers/body timing, bounded HTTP codes, Retry-After presence and retry count without query text/key/raw error strings. Existing evidence cannot establish a Vercel block, Photon ban, physical instance count or address family. Do not pin IPs or bypass network/security policy to guess.
4. In that SAME server environment run ONLY four synthetic user queries: Donetsk, Donetsk Rostov region, Volnovakha, Krasnodar. Maximum4independent-provider calls, no automatic repeats; stop on429. Preserve sanitized original response fields, HTTP statuses, hashes, attribution/precision/admin provenance with bounded response byte reading (existing readLimitedProviderJson can be reused with an address-appropriate cap). Review both Donetsk identities and coordinates, Volnovakha polygon membership, and control-city admin label. No hard-coded answers or fabricated OSM identities.
5. Controlled server-side primary outage plus REAL independent fallback response is a separate integration check; label the fault as injected. Compare it with saved real Photon failures. It is not an actual live outage observation. Verify returned public suggestions only AFTER source admission. All-unavailable/invalid-data/cancelled/expired requests must remain errors, with no late or invented suggestion.
6. Check successful primary does not call fallback; no total request over20s; no extra upstream load on ordinary successes;429/cooldown handling and license attribution. Enforce provider/account quotas across replicas before public enablement. Do not weaken source completeness assertions merely to pass the check.
7. Only then perform the bounded real desktop/mobile clear/re-entry scenario and record actual results. Current16Preview502s remain FAIL evidence, not replaced by research tests. No mass route/tariff audit.

Admission gates missing: key/free-quota authorization; real Geoapify regional data and server reachability; source/admin/coordinate review; production-grade body/quota handling; approved branch integration/publication; Preview controlled-failover test. Until then B05.7 is research preparation only and B05.8 is a runnable review recipe plus blocked real acceptance, not DONE.
