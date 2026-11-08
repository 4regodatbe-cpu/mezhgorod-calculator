# B01 — network restored, real prefix failure reproduced

Status: DONE diagnosis / runtime fix NOT DONE. 28.10.2026, Moscow.
Source HEAD: f0e2119fcf0d83f10a74291025cd2ee4356b1d58; permitted branch fix/v3-missing-route-prices-2026-10-15; PR14 Draft.

## Observations

Standard proxy and TLS verification, exec with with_additional_permissions/network.enabled=true: GitHub HTTPS 200 (0.170s), public /v3 200 (0.943s), Photon /api q=Волноваха limit=5 200 (0.844s), OSM relation R-3106795 present. No proxy changes. Fresh isolated worktree /workspace/address-network-restored created from fetched HEAD; old worktrees untouched.

Bounded synthetic public POST /r probes: Волноваха 200/0.430s, first R-3106795; Донецк 200/1.052s, first R-1413957 (ДНР), second R-1517207 (Ростовская область). Prefix Доне returned 502/20.384s. Direct Photon prefix request returned 200/0.812s. Availability varies by environment/request; a successful direct probe does not disprove the server incident.

Vercel read-only runtime log at 17:17:40.258Z (20:17:40 MSK): POST /r, address_search_unavailable, elapsedMs=20003, sourceCount=7, failures={connect_timeout:2,budget:5}, budgetExpired=true. The first two provider requests failed to connect; the query deadline expired with five other variants. This proves server/provider connection failure plus shared-budget exhaustion in the reproduced prefix request, not missing provider records or a demonstrated client AbortController defect. A prior partial log showed http_503:5/source_cooldown:1 with usable results. No customer query text is added to application logs.

Current production source is 051d51ea4e4e40b21245af4f7e21b2fea4c4f00f; read-only deployment inspection confirms it. No deployment changes made.

## Checks and limitations

Node24.19.0: node --import ./scripts/register-ts-paths.mjs --test scripts/photon-request-pool.test.ts scripts/address-search-endpoint.test.ts scripts/address-search-proxy.test.ts — PASS, 3/3 file-level tests. This is existing deterministic coverage, not a live browser acceptance test. Full Yalta→SPb calculation, mobile UI, Preview, outage fallback and ten replacements remain UNVERIFIED. No runtime correction, full audit, CI rerun or Production publication.

Confirmed secondary defect: snapshot lookup occurs after collection with the original deadline, so total-budget exhaustion makes the disabled snapshot return budget. Enabling four-city snapshot alone cannot solve Volnovakha or provide a durable independent provider.

Next: reproduce queue starvation/cancellation under controlled slow upstream, prepare the smallest evidence-backed backend/fallback correction and regressions. Runtime publication currently triggers broad live jobs; standing prohibition on additional broad audits still applies. Do not bypass classifier or repeat unchanged network diagnostics.
