# Experiment11 — B11 saved evidence / duplicate geometry analysis —28.10.2026

Baseline runtime remains `ea2fd912c3ec046065c19896b411bf1abb2f34fa`.
B01 experimental publication `dd04293d13290a8818a4b960effff4c0cff8d6ba`
has the same app/lib/data bytes. No new live route/provider request or old
24-block audit, recovery-cache benchmark or full replay was performed.

## What existing measurements actually establish

| Boundary | Saved observation | Interpretation / limits |
| --- | --- | --- |
| Address selection | [Proxy-aware local flow](checks/2026-10-28-proxy-live-flow/REVIEW.md): browser/r 3606/1144ms; server collector1710/716ms | Includes debounce/cold compile; external Photon variants partly503/cooldown. Not full calculation latency; full Photon outage remains B01. |
| Geocoding in calculation | [Ordinary](../road-ref-boundaries/checks/2026-10-24-calculation-runtime-live/calculation-runtime-probe.json)0.126ms, [special](../road-ref-boundaries/checks/2026-10-24-special-runtime-live/calculation-runtime-probe.json)0.054ms | These callers supply positions. Does NOT measure fresh address lookup or prove geocoding is always cheap. |
| Routing/providers | Ordinary routing1437.258ms; providerValhalla1184.760/OSRM931.007/BRouter1422.401ms. Special routing1115.330ms | Parallel/allSettled waits, not additive. Provider spans include transport, response parsing and geometry evidence. Saved decode-only Eisk9.0735/Maykop6.1167ms medians are different fixtures, not an exact network subtraction. |
| Toll matching | Ordinary659.430ms, special3267.508ms | `validateTollEdges` includes external Valhalla trace chunks/retries and local evidence derivation. It is NOT measured CPU alone. Exact network-vs-CPU split absent from these historical spans. |
| Toll pricing | Ordinary48.794ms, special891.989ms | Application/evidence work; inspect `route-leg-pricing.ts` call tree before declaring CPU-only, since M4 resolution can obtain additional evidence. No mandatory checks removed. |
| Final response pricing | Ordinary10.387ms, special590.168ms | Synchronous `attachPricing` includes territory analysis and four vehicle fare payloads. Actual `NextResponse.json` serialization is outside this named span, although included in handler total. |
| Whole handler | Ordinary2225.425ms, special7318.419ms | Two historical one-off CI-host observations, not browser/Vercel E2E/SLA. Nested/parallel durations must not be added; import/cold start and client network have separate boundaries. |

Existing offline profiles remain authoritative for their exact fixtures:
`docs/codebase-audit/computation-maykop-profile.json` recognition64.922ms,
recovery17.839ms; `provider-route-decode-profile.json` saved decode/evidence
6–9ms median. Already completed endpoint cache improvement not repeated.

## Proven redundant work, separate from unmeasured network hypotheses

`lib/v3-calculation/special-options.ts:49` computes `split=analyzeRoute(...)`
for each valid candidate using its original coordinates/meters/seconds,
the same from/to positions and verified zones. `PricedCandidate` retains that
split and the selected route geometry. At
`app/api/v3/calculate/route.ts:85`, `attachPricing(option.fast)` computes the
same analysis again, instead of consuming `option.split` at line107.
The second call is synchronous and does not improve route/tariff evidence.
This is one concrete duplicate calculation, not a proposed shortcut around
tariff coverage or fastest-route selection.

### Bounded new offline experiment

`b11-response-split-profile.mjs`: one retained Donetsk→Moscow OSRM body,
9046 points; no route choice/pricing replay, no fetch. One untimed warmup,
three paired samples with alternating order. Baseline analyzes twice; proposed
same-call reuse analyzes once. All split results and input geometry hashes match.
[Full source/body/geometry/boundary SHA and samples](b11-response-split-profile.json).

Node24.19.0: median1748.963489→869.093405ms, saved879.870084ms in this
isolated fragment (~50.3%). This does NOT claim879ms saved on the historical
7318ms request (different fixture/code execution/host), nor on every route.
Three tests verify source/boundary/result hashes, split equality, all four
vehicle fare payloads in both pricing modes, and patch scope. No wall-clock
threshold is used as a fragile assertion.

### Publication blocker and exact next action

`b11-reuse-territory-split.patch` is a three-line proposal with successful
`git apply --check`, **not applied to runtime or claimed deployed**. It keeps
ordinary-path analysis and supplies the already-verified same-route split only
for special options. Full route/API regression and TypeScript checks on applied
code remain necessary; current tests prove the reuse concept, not the full patch.

The unchanged classifier actually returns
`{shouldRunLive:true,reason:"route-runtime-changed"}` for
`app/api/v3/calculate/route.ts`. Publishing the application fix would initiate
the prohibited broad live audit. No new exception/skip/workflow change was
authorized here. Preserve mandatory checks; request a separate narrow CI/isolated
validation decision before runtime publication. Do not globally exempt API paths
or claim previous runtime changes live-verified. No application performance
defect is marked fixed yet; B11 remains PARTIAL.

B01 follow-up needs a normally provisioned provider key and reviewed real
responses; no further identical public-Photon query or GeoNames work is useful
without that input. Snapshot stays disabled; last-official-edition tariff policy
and all unknown/null/geometry/fastest-route rules unchanged.
