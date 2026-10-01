# Segment 4C — M-4 walk_or_snap concurrency tuning

Date: 2026-09-30
Status: PLANNED / waiting for Segment 4B rollback verification

## Goal
Reduce M-4 local PVP validation latency without changing the evidence model, tariff model, route geometry, matching mode, timeouts or result semantics.

## Baseline
Segment 4A with `shape_match=walk_or_snap` and `CONCURRENCY=3`:
- 10/10 control directions complete;
- 192 labelled candidate checks;
- 162 confirmed / 30 rejected / 0 unknown;
- average validator time 18,371 ms;
- max validator time 19,741 ms.

Segment 4B proved that changing the matching mode to `edge_walk` is unsafe and was reverted.

## Method
1. First confirm rollback restored the Segment 4A evidence pattern.
2. Test only `CONCURRENCY=4`, leaving `walk_or_snap` unchanged.
3. Run the same 10-direction Segment 4 probe under the 10-minute workflow cap.
4. Accept level 4 only if all 10 routes are complete, `unknown=0`, candidate labels/pricing remain consistent with baseline, and average validator latency improves materially.
5. If level 4 is safe, optionally test level 5 as a separate subsegment; if any provider instability/rate-limit/unknown appears, revert to the last proven level.
6. After choosing a level, run the full Segment 1 user API regression before checkpointing.

## Reject conditions
- any `unknown` introduced;
- any expected confirmed/rejected PVP changes without independent explanation;
- any M-4/A-289 price regression;
- increased provider failures / 429s;
- no meaningful latency improvement.

## Safety
This segment changes scheduling only. `walk_or_snap`, exact expected-node proof, official pricing and fallbacks remain untouched.
