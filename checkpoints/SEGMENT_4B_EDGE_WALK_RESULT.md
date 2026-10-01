# Segment 4B — edge_walk local M-4 matching — REJECTED

Date: 2026-09-30
Experimental commit: `51e4050b62d7cfb5599b55269cc2997e87a95276`
Workflow run: `36701053276`
Rollback commit: `b876322bf54465ac4f6f874ce55a08f0347aab04`

## Goal
Test whether Valhalla `trace_attributes` with `shape_match=edge_walk` can replace `walk_or_snap` for the existing local M-4 windows while preserving exact PVP evidence and reducing latency.

## Result
Rejected. The experiment produced incomplete validation on all 10 control directions.

Observed examples:
- southbound routes: PVP 515 and often PVP 545 became `unknown`;
- northbound routes: PVP 515 became `unknown`;
- validator wall time still remained roughly 13–21 seconds per route, so there was no safe latency win.

The previous Segment 4A baseline with `walk_or_snap` produced 192 labelled candidate checks with 162 confirmed, 30 rejected and 0 unknown.

## Decision
`edge_walk` must not be used in production for these sampled local windows. Exact M-4 evidence remains on `walk_or_snap`.

The experimental one-line change was reverted immediately. No pricing thresholds, tariff logic, route selection, M-4 plaza data or user API semantics were changed.

## Next
Segment 4C will test performance only by changing request scheduling/concurrency while keeping `walk_or_snap` and the exact same evidence model. Any increase in unknown/rate-limit/provider failures or any pricing regression rejects the tested concurrency level.
