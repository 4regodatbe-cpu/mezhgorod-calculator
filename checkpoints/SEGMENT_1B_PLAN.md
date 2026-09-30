# Segment 1B — baseline-safe differential gate

Date: 2026-09-30
Branch: `optimize-calculator-2`
Starting head: `9a4ec1e35e2203b4e2c0fa82f9f25f43a536592e`

## Why this subsegment exists

The final Segment 1 workflow is red even though the branch user API regression passed all exact M-4 and M-4+A-289 controls. The failure came from the external production baseline returning HTTP 504 for Yalta↔Moscow before the candidate was evaluated in the differential script.

## Goal

Make the differential gate distinguish a candidate regression from an unavailable external baseline. The candidate must always be tested independently first. Production comparison remains useful when available, but a production timeout/5xx must not be reported as a branch calculation failure.

## Invariants

1. Candidate request failure always fails the case.
2. Exact evidence-based Yalta↔Moscow controls must satisfy 5625/7625 ₽ and A-289 frame evidence independent of production availability.
3. Pure/mixed protected routes must retain local safety guards even if production baseline is unavailable.
4. When baseline is available, distance/toll differential checks remain enforced.
5. Baseline timeout/5xx is recorded explicitly as `baseline_unavailable`; it is never silently ignored.
6. No unknown/unavailable result is converted to 0 ₽.
7. Whole Segment 1 CI attempt must be forcibly bounded to at most 20 minutes.

## Planned code changes

- `scripts/segment1-differential.mjs`
  - calculate candidate first;
  - run candidate-only invariants before baseline;
  - fetch baseline with shorter bounded timeout;
  - if baseline fails, keep candidate result and record warning/state rather than failing solely on baseline availability;
  - if baseline succeeds, enforce distance and protected-total comparison as before.
- `.github/workflows/segment1-user-regression.yml`
  - reduce job timeout to 20 minutes.

## Success criteria

- build succeeds;
- user API exact regression remains green;
- differential script does not fail solely because production returns 504;
- candidate regressions still make the workflow fail;
- final run completes within 20 minutes.

## Rollback criterion

If the revised gate can pass a deliberately bad candidate result, revert this subsegment and redesign the gate before proceeding.
