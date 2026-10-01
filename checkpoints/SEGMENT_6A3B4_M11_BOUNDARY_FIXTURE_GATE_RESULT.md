# Segment 6A3B4 — M-11 boundary fixture gate result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN
Production `main`: unchanged.

Workflow `Segment 6A3B4 M11 boundary fixture gate`, run `36873961988`, completed SUCCESS at head `31bb8fdae43f8baf5282d747bda555626fc5b33c`.

The gate proves:
- p58→p679 and p593→p679 verified-anchor traversals resolve;
- reverse p679→p58 resolves directionally;
- a route entering M-11 before p58 cannot falsely relabel p58 as its entry boundary;
- 15–58-only routes remain unresolved until that system has trusted spatial anchors;
- candidate-only and non-M11 evidence remain unresolved;
- same-position conflicting boundary evidence fails closed as ambiguous;
- output remains money-free and production API remains untouched.

The endpoint-proof rule was added specifically to prevent a cross-system Moscow-side traversal from treating internal p58 as the route entry merely because p58 is the first currently anchored 58–679 point.

## 6A3B conclusion

The deterministic boundary layer is green for the independently verified current 58–679 anchor subset and explicitly unresolved outside that subset. It is safe to feed these resolved IDs into a pure tariff-selection layer because missing spatial coverage cannot silently become a guessed boundary.

## Next

6A3C: compose boundary resolution with the strict partial current tariff core. Only directly verified current directed pairs may become `priced`; every other resolved or unresolved route must remain `unknown/null`.