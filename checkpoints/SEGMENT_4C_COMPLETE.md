# Segment 4C — M-4 concurrency tuning — COMPLETE

Date: 2026-09-30
Promoted source commit: `ffbab1338af6d8762a03a28beba546b1f3e1ab23`
Final branch regression run: `36720431413` — SUCCESS

## Goal
Reduce M-4 local PVP validation latency without changing evidence semantics, tariff logic, route selection, matching mode, timeouts or exactness rules.

## Baseline
Safe baseline before this segment:
- `shape_match=walk_or_snap`;
- `CONCURRENCY=3`;
- 10/10 M-4 control directions complete;
- 192 labelled candidates;
- 162 confirmed / 30 rejected / 0 unknown;
- observed average validator time varied from ~16.36 s to ~18.37 s.

## Probe
A diagnostic-only workflow changed only its ephemeral runner copy to `CONCURRENCY=4`.

Probe run `36718699421` result:
- complete routes: 10/10;
- labelled candidates: 192;
- confirmed: 162;
- rejected: 30;
- unknown: 0;
- average validator time: 14,916 ms;
- max validator time: 16,913 ms.

This preserved the exact control-corpus classification while improving average latency by about 9% versus the most recent 16.36 s baseline and about 19% versus the first 18.37 s baseline.

## User-path promotion gate
A separate <=20 minute promotion workflow applied `CONCURRENCY=4` only inside its runner, built the app and ran the full real `/api/v2/calculate` regression. All 12 user controls passed. Its final commit step intentionally failed because `pnpm install` also modified `pnpm-workspace.yaml`; the safeguard correctly refused to commit an unexpected file. This was a workflow mutation issue, not a calculator failure.

Because the candidate had already passed the full user regression, the single proven source line was then committed directly:
- `const CONCURRENCY = 3;` → `const CONCURRENCY = 4;`
- no other source logic changed.

The normal branch regression automatically ran on the actual commit and completed successfully as run `36720431413`.

## Decision
Accepted:
- `walk_or_snap` retained;
- exact expected OSM toll-booth node proof retained;
- all timeouts/budgets retained;
- concurrency increased from 3 to 4.

Rejected approaches remain rejected:
- geometry-only crossing proof;
- `edge_walk` on sampled local windows.

## Next
Segment 4D is research-only: determine whether original Valhalla `/route` PBF can expose the exact OSM node IDs/types required to prove known M-4 PVP traversal and eliminate the second `trace_attributes` layer. If it cannot, retain Segment 4C as the safe M-4 performance endpoint and proceed to M-12.
