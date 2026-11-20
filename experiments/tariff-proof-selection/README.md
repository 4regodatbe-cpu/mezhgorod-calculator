# Experimental tariff proof selection — 27.10.2026

Scope B04/B10; no app imports, switch or public integration. Root cause: known physical endpoints and plausible subtotals do not prove operator coverage or complete cost.

Alternatives:

| Method | Data needed | Cost/risk |
| --- | --- | --- |
| Exact operator entry–exit quote | Reviewed directed endpoint mapping, date/category/payment context, complete coverage | Small lookup; needs published full pair, avoids intermediate-booth assumptions |
| Sum graph edges | Same boundary proofs plus operator evidence of additivity | Higher data/model complexity; non-additive pricing invalidates arithmetic composition |
| Evidence arbitration (prototype) | Explicit coverage obligations and reviewed monetary witnesses | Small bounded filter; rejects incomplete/conflicting witnesses rather than preferring cheaper amount |

Selected experiment: proof arbitration. `select.mjs` accepts externally reviewed, directed coverage obligations and monetary witnesses. Full pair can prove coverage without intermediate prices; graph chain is admitted only with reviewed additivity. Partial coverage, reverse/different identities, missing source/context and conflicting complete prices return unknown/null. No route selection or pricing rules changed.

Saved real input: `experiments/nationwide-tolls/M4_GRAPH_ENDPOINT_REGISTER.json`, pending nodes4443232947→358467208. Existing register has no monetary witness (`rub`, `fareSource` null); prototype returns unknown, matching existing fail-closed policy. This is not a new geometry replay. Other positive cases are explicitly synthetic123-unit fixtures, not real tariffs. No reduction of real unknown fares is claimed.

Compared with current implementation: the prototype centralizes the decision about proof completeness/conflict instead of letting a numeric subtotal imply completeness. It does not yet derive coverage obligations, verify sources, map physical endpoints, compose different independently billed roads, or parse operator documents. `reviewed` fields are trusted experimental inputs, not self-generated certification. A production adapter must bind context and reviews to immutable evidence records; this experiment is not ready for public integration.

Verification: `node --test experiments/tariff-proof-selection/select.test.mjs` PASS (one test-file aggregate reported by current runner); `git diff --check` PASS. No mass audit/build/provider calls. Additional source discovery and separate cross-road composition experiment remain next. B04/B10 PARTIAL; missing operator mapping and fare remain BLOCKED_BY_DATA. No new primary tariff documents or proved tariff pairs in this block.
