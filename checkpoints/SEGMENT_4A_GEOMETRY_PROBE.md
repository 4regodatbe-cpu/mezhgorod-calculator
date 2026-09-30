# Segment 4A — M-4 geometry/evidence benchmark — COMPLETE

Date: 2026-09-30
Workflow run: `36700119800`
Artifact: `segment4-m4-geometry-probe` (`11089851130`)
Result: probe completed successfully in about 3m18s after local server start.

## Corpus

10 M-4 control directions:
- Ейск ↔ Москва;
- Майкоп ↔ Москва;
- Краснодар ↔ Москва;
- Сочи ↔ Москва;
- Ялта ↔ Москва.

All 10 routes completed validation. Across the corpus:
- labelled candidate checks: 192;
- confirmed: 162;
- rejected: 30;
- unknown: 0.

## Timing

Current `validateKnownM4Plazas()` cost:
- average validator time: 18,371 ms / route;
- maximum: 19,741 ms;
- aggregate validator time across 10 sequential controls: 183,714 ms.

This confirms that the second remote local `trace_attributes` layer is a material part of user-request latency.

## Geometry threshold result

Observed nearest route-shape distance:
- confirmed PVPs: 4–53 m;
- rejected candidates: 3–345 m.

Threshold confusion matrix:
- 5 m: TP 15 / FP 5 / FN 147 / TN 25;
- 10 m: TP 40 / FP 5 / FN 122 / TN 25;
- 20 m: TP 106 / FP 15 / FN 56 / TN 15;
- 50 m: TP 157 / FP 20 / FN 5 / TN 10;
- 100 m: TP 162 / FP 20 / FN 0 / TN 10.

There is NO threshold with both any true positives and zero false positives.

Critical examples:
- PVP 62 is rejected while route shape comes as close as 3 m in the southbound direction;
- alternative PVP 355 is rejected at 13 m while nearby PVP 339 is correctly confirmed;
- PVP 672 is a clear geometric reject at roughly 330–345 m;
- confirmed PVP 545 can be 47–53 m from the stored anchor centroid.

## Decision

Do NOT promote route-shape proximity to proof of PVP crossing. Geometry is useful only for candidate selection/rejection of clearly distant cases.

Segment 4B will retain exact node/edge evidence but test a cheaper Valhalla trace mode (`edge_walk`) on the local windows. This is appropriate to test because the windows are cut from an already Valhalla-routed polyline. Any mismatch in confirmed/rejected status, loss of completeness, or pricing regression requires immediate rollback to `walk_or_snap`.
