# ZSD finding classification DONE — 76/76 cases

2026-10-16T17:41:54Z. Branch `fix/v3-missing-route-prices-2026-10-15`, draft PR14. Parent PR head `29c15aa234ecac2b07049323634a1ea47dc14feb`.

Part19’s ZSD route case queue has now processed all 76 saved cases. Classifying the historical `zsd:unpriced` finding after the replay and scope checks: **source-gated because the operator’s finished collection span is not bound by primary evidence**. It is not confirmed as a current runtime bug, and this audit does not fix or price ZSD. The 76-case and 2-profile counts measure audit reproducibility only, not fare confirmation. Two records have no missing-component list, which is not evidence that the corresponding routes are free.

Evidence groups: 53 cases reused an already reviewed ZSD scope; 9 required distinct finished-scope review; 11 matched exact reviewed way sets; the remaining 3 are separately classified identity/KAD/source-gate cases. Per-case missing-component distribution and exact counts are in `evidence/2026-10-16-zsd-queue-classification.json`. Across the group, other unresolved items include CKAD, M11 head/tail and unknown paid roads.

No runtime source changed. No code tests or full gate were run for this metadata/evidence classification. Historical full-gate result remains historical, not rerun here. Overall plan progress remains **90% (18/20 parts)**; Part19 stays IN_PROGRESS and Part20 PLANNED.

NEXT STARTED: review the next historical finding `m4:unpriced` using its 22 saved evaluations, classify confirmed behavior vs source-gated scopes without new fare assumptions, and save one finding checkpoint before moving on.
