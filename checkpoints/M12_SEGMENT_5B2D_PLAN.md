# M-12 Segment 5B2D — conservative user-API integration plan

Date: 2026-09-30
Branch: `optimize-calculator-2`
Base checkpoint: `f16dc9eedbaa2012f945e4ee86914c95ab1988b3` (`Checkpoint M12 Segment 5B2C pure core green`)

## Goal

Integrate the already-proven pure M-12 route core into `/api/v2/calculate` without weakening M-4/A-289/mixed-road handling and without creating a second full-route network request.

## Segmentation

### 5B2D-1 — expose strict M-12 span from the existing fast Valhalla response

- Keep the same fast Valhalla `/route` request.
- Request maneuvers only for `use_tolls=1`; keep the free-route request lightweight.
- Derive strict M-12 route-chainage span from maneuver street names + shape indexes using the same semantics proven in 5B2B/5B2C.
- Store the span next to the fast route geometry so geometry and span always come from the same response.
- No pricing change yet.
- Gate: TypeScript/build + deterministic helper assertions, timeout <= 10 min.

### 5B2D-2 — compute M-12 result inside `leg()`

- Feed the exact same fast Valhalla geometry and strict span into `calculateM12FromRoute()`.
- `priced` may be promoted; `unknown` must remain unknown and may only fall back to legacy behavior.
- Never convert missing M-12 evidence into `0 RUB`.
- No second Valhalla request, no Overpass, no `trace_attributes`.

### 5B2D-3 — conservative toll composition

- Keep `geometricTolls` unchanged for M-4 mixed-road detection.
- When M-12 core is `priced`, replace only the legacy M-12 monetary component; preserve independently detected non-M-12 components.
- Do not allow exact M-12 pricing to erase M-4, M-11, A-289, CKAD, regional, or other toll evidence.
- If exact composition cannot be proven for a mixed route, fall back rather than inventing a sum.

### 5B2D-4 — user-API regression gate

Required before checkpoint:

1. full build;
2. existing Segment 1 M-4/A-289 user regression remains green;
3. Segment 3 free-truth regression remains green;
4. new M-12 user-API assertions cover at least:
   - Moscow -> Kazan;
   - Kazan -> Moscow;
   - partial-entry/exit controls from the deterministic fixture;
   - one deliberately `unknown` control;
5. exact M-12 amount must equal pure-core expected result for the same route geometry;
6. no `0 RUB` when core is unknown/incomplete;
7. each workflow/job timeout <= 20 min.

## Rollback / stop conditions

- Any M-4/A-289 regression: revert only 5B2D changes and investigate composition boundary.
- Any direction-dependent M-12 mismatch: do not weaken core invariants; inspect span extraction or route parity.
- Any run > 20 min: stop waiting, split the gate or remove unstable external dependency.
- Any need for a second full-route network call: stop and redesign; 5B2D explicitly forbids it.

## Production safety

- `main` and production are untouched during 5B2D.
- Work only on `optimize-calculator-2`.
