# B07 allocation-context guard — local regression PASS (28.10.2026)

Status: targeted offline regression complete; GitHub publication remains blocked by the existing security review.

The recovered official Appendix 3 rule says the M12↔Nosovikhinskoe initial/final allocation depends on recorded section sequence and whether the corresponding frame is recorded within 120 minutes. The existing CKAD matrix marks 16 directed rows `requiresTariffContext: true`. `matrixCkadComponent` currently receives no registration-history context, and the quote engine returns `unresolved-operator-tariff-context` for each row. Therefore these 16 pairs remain `unknown` instead of being charged from geometry alone. Ordinary CKAD vectors remain separately priced by their existing tests.

Added a regression loop to `experiments/nationwide-tolls/engine/endpoint-product-integration.test.mjs`: enumerate all 16 flagged directed rows and assert `tolls === null` with the exact context reason. No tariff values, route boundaries, or allocation rules changed.

Check: Node v24.19.0; `node --import ./scripts/register-ts-paths.mjs ./experiments/nationwide-tolls/engine/endpoint-product-integration.test.mjs` — 6/6 subtests PASS; `git diff --check` PASS. This is a focused regression only; no new route replay or network query.

Local parent before this block: `0806c4df39080bef1200324d2916f8fe8876e11b`. No remote commit, remote readback, or CI run is claimed. B07 remains PARTIAL: actual registration sequences and timestamps for a route are not available, so the correct fare allocation for an affected real journey is not established.

Next: resume only with a saved registration/section history containing the required frames and timestamps, or another exact official evidence source. Otherwise continue an independent block. Preserve `unknown` for all 16 unsupported contexts.
