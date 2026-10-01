# Segment 6A3B4 — M-11 boundary resolver fixture gate plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: STARTED
Production `main`: unchanged.

## Goal

Prove the resolver fails closed across the boundary cases required by the original 6A3B plan, including cases whose spatial coverage is intentionally incomplete.

## Required controls

- full current verified 58–679 traversal p58→p679;
- 58–679-only partial traversal p593→p679;
- route entering M-11 before p58 (cross-system / 15–58→58–679): must not falsely relabel p58 as entry;
- 15–58-only traversal with no verified 15–58 anchor set: unresolved;
- candidate-only M-11 clue: unresolved;
- non-M-11 control: unresolved;
- deliberately ambiguous same-position boundary evidence: unresolved;
- reverse p679→p58 direction.

## Success criteria

All fixtures deterministic and green; unsupported spatial coverage remains explicit `unresolved`; no monetary fields; full production build green; no production API integration.