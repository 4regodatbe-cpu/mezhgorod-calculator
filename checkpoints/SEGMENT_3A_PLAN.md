# Segment 3A — Valhalla hard-toll-exclusion capability probe

Date: 2026-09-30
Branch: `optimize-calculator-2`

## Why this subsegment exists

The current “free” Valhalla request uses `use_tolls: 0`. That is a preference/penalty, not proof that toll edges are forbidden. Current Valhalla supports experimental `exclude_tolls: true`, but only when the concrete server enables `service_limits.allow_hard_exclusions`; otherwise the option is ignored with a warning.

## Goal

Measure the behavior of the exact public service used by Calculator 2.0: `https://valhalla1.openstreetmap.de`.

## Method

For Moscow→Krasnodar, request three routes with the same coordinates:
1. normal/fast: `use_tolls: 1`;
2. avoid preference: `use_tolls: 0`;
3. hard exclusion candidate: `exclude_tolls: true` (with normal toll willingness otherwise).

Record for every request:
- HTTP status;
- route length/time;
- response `warnings` verbatim;
- whether the hard-exclusion route materially differs from the fast route and resembles the avoid-toll route.

## Decision rule

Hard exclusion may be promoted only if:
- request succeeds;
- response contains no warning that the hard exclusion was ignored/disabled;
- route behavior is consistent with toll exclusion on the known Moscow→Krasnodar control.

If the server does not enable hard exclusions, keep current provider call as a candidate generator only and rely on strict independent validation/truth-state handling in Segment 3B.

## Safety

This segment does not modify `/api/v2/calculate` or UI behavior. It is a read/probe experiment only.

## Time limit

Workflow hard cap: 5 minutes. Each external request: 25 seconds. No automatic retry loop beyond one request per mode.
