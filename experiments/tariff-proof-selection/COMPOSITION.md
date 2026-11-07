# Experiment 2: independent charge composition — 27.10.2026

Root cause B04–B10: road geometry, charging scope, and monetary evidence have different identities. Combining road names or subtotals cannot establish complete independent billing.

## Alternatives

| Method | Strength | Limitation |
| --- | --- | --- |
| Directed tariff graph | Indexed directed lookup, useful for physical traversal | Edge sums require proved additivity; shortest-cost path is inappropriate for a fixed selected route |
| Non-overlapping exact covers (selected prototype) | Explicit coverage and duplicate detection; compare complete alternate totals | Exponential worst case; prototype caps20 quotes/32 obligations/10000 states and returns unknown if exhausted |
| Operator-zone partition | Scales by independently billed domains | Different operator/road names alone do not prove independent collection; overlapping concessions need reviewed boundaries |
| Proof frontier / interval dynamic programming | Promising for ordered route obligations with contiguous coverage | Not implemented; requires monotone interval identity and must preserve conflicting totals, not only minimum price |

## Implemented

`compose.mjs` keeps admitted quote records separate from route callers. Admission requires document bytes/SHA256, record hash and reviewer/reference in a separate trusted manifest; records include operator, entry/exit, direction, class, payment, validity dates and coverage. Caller `reviewed=true` is insufficient. Returned registry/policies cannot be forged by plain objects or mutated after admission. Source authentication and reviewer authorization remain external: these hashes certify integrity only; the experiment does not read a document and magically verify a tariff.

Composition requires an admitted policy establishing independent domain pairs or same-domain additivity. Context must match exact directed traversal, class, payment and inclusive validity dates. Every complete cover uses each atomic charging obligation once. Multiple complete covers with equal totals agree; differing totals return unknown/null. Missing coverage, overlap, no independence/additivity admission, malformed date or search exhaustion return unknown. No cheapest-amount selection. Full operator pairs need no intermediate-booth prices.

Tests use explicitly synthetic documents and100/200-unit amounts for M4+M11, M4+A289 and M11+CKAD. These labels exercise composition structure only; they are NOT new real route/charging evidence. Ten named test cases are in `compose.test.mjs`; current runner reports one passing file aggregate. Saved real M4 pending topology remains covered by prior experiment test; no new geometry/capture audit performed. No real operator fares have been admitted.

Verification: `node --test experiments/tariff-proof-selection/compose.test.mjs` PASS, `git diff --check` PASS. No runtime integration, routing calls, tariff edits or default activation. Remaining: actual source-bound geographic correspondences, operator additivity/independence documents, robust registry schema validation, reviewer authorization and context-specific policy validity. Prototype is not ready for deployment. Next block: bounded official document research for M4 pending pair and M11 incomplete sequence.
