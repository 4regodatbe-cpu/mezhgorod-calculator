# Segment 9 — external toll-provider benchmark — PLAN

Date: 2026-10-01
Base: `optimize-calculator-2` after Segment 8.
Working branch: `segment9-external-toll-benchmark`.

## Goal
Test an external toll provider against official/independently controlled Russian toll-road evidence. Never promote an external provider merely because it returns a number.

## Provider selected for executable adapter
HERE Routing API v8. Public documentation confirms `return=tolls`, toll summaries/details, toll systems and explicit `tollsDataUnavailable` notices. The adapter is optional and requires `HERE_API_KEY`; no key is committed.

TollGuru remains a candidate for a later second-provider comparison, but Segment 9 does not fabricate observations without authenticated API access.

## Benchmark corpus
At least 30 deterministic cases, covering M-4, M-11, M-12 and CKAD. Cases include positive toll traversals, mixed corridors and negative controls. Official-control fields are evidence-gated: where current exact amount is not independently proven, expected amount remains null and the benchmark scores coverage/geometry/failure semantics only.

## Acceptance invariants
1. External provider is benchmark/validator only; production pricing is unchanged.
2. `unknown`, provider failure, `tollsDataUnavailable`, currency mismatch or malformed fare can never become `0 RUB`.
3. Exact-amount accuracy is scored only where official current amount evidence exists.
4. Route compatibility is scored separately from toll amount.
5. Coverage is scored separately for M-4/M-11/M-12/CKAD.
6. Benchmark result stores provider, timestamp, request class and failure mode; never stores API keys.
7. No sole-source promotion is allowed by Segment 9. A later production fallback requires an explicit evidence decision.

## Subsegments
- 9A provider capability/evidence audit.
- 9B 30+ route benchmark corpus.
- 9C pure benchmark classifier/scorer.
- 9D optional HERE live runner with fail-closed parsing.
- 9E deterministic regression gate and checkpoint.
