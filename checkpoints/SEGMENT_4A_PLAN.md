# Segment 4A — M-4 geometry/evidence benchmark

Date: 2026-09-30
Branch: `optimize-calculator-2`
Mode: probe only; no production evidence threshold changes.

## Question

Can the already road-snapped fast-route polyline resolve a subset of known M-4 PVP crossings deterministically, avoiding a second remote Valhalla `trace_attributes` request, without introducing false positive toll events?

## Evidence to collect

For the established M-4 control corpus in both directions:
- route distance;
- validator total elapsed time;
- every M-4 candidate in route order;
- PVP km/model;
- `nearestDistanceKm` between route shape and known PVP anchor;
- current validator result: `confirmed`, `rejected`, `unknown`;
- candidate/confirmed/rejected/unknown counts;
- pricing status and exact amounts.

## Threshold analysis

For a grid of tight geometry thresholds, predict `crossed` when `nearestDistanceKm <= threshold` and compare that prediction with the current local-node validator on complete runs.

Report for every threshold:
- true positives;
- false positives;
- false negatives;
- true negatives.

A threshold is NOT eligible for implementation if it produces any false positive in the corpus. A zero-false-positive result is only a prerequisite, not sufficient proof; rejected branch/parallel-road cases must be inspected individually before code changes.

## Timing

One probe workflow attempt is capped at 10 minutes. If it cannot complete, split the corpus into smaller route groups rather than increasing the timeout.

## Non-goals

- no change to `m4-route-validator.ts`;
- no change to pricing;
- no fallback changes;
- no production deploy;
- no weakening of exactness assertions.

## Success criterion

Produce a persisted report that tells us whether route-shape proximity has a clean separation region and how much remote validation time is currently spent. Only then decide Segment 4B.
