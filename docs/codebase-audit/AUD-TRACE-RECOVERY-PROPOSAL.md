# AUD-TRACE-RECOVERY-01 — proposed public behavior (approval required)

Status: PROPOSAL ONLY. No implementation or change to the current pricing/business rule has been made.

## Evidence basis

The saved synthetic M12 fixture produces the same approximate recovery output (`995`) for complete and incomplete trace metadata. Both currently serialize as public `pricingStatus: "priced"`. The partial case has `complete:false` and `boothEventCoverage:"partial"`; the complete case only proves trace request coverage, not that the approximate corridor fragments form a complete route-wide tariff. This is a synthetic helper result, not an official tariff or an observed user incident. Details and the test are in [AUD-TRACE-RECOVERY-01.md](AUD-TRACE-RECOVERY-01.md) and [the focused regression](../../scripts/v2-partial-trace-recovery.test.ts).

## Proposed rule for approval

1. A corridor-recovery subtotal is diagnostic evidence, not a complete fare by itself. Do not expose its positive amount as a public full-route price or set public status to `priced` solely because the subtotal is positive.
2. Keep that subtotal and segment labels only as diagnostic details. If no independent route-wide tariff composition establishes the full amount, serialize monetary totals as `null` and `pricingStatus: "unknown"`; never substitute zero.
3. An incomplete trace (`complete !== true` or incomplete booth-event coverage) must not qualify for the more permissive map-matched recovery gate. This proposal does **not** change the numeric M4/M12 thresholds; the existing threshold data remains untouched.
4. A complete trace is not automatically tariff proof either. Public `priced` should require evidence that every relevant charge on the selected route is covered by a supported tariff engine, not merely complete transport of trace chunks or a positive corridor subtotal.
5. Preserve exact/composed prices already supported by their route-wide engine evidence, unknown handling for missing tariffs, and all current fare values/road boundaries.

## Decision requested

Approve, reject, or amend the rule above before implementation. Until that decision, keep runtime behavior unchanged; the new tests are characterization tests and intentionally document the current output.

## Risk / scope

Changing public status or suppressing an approximate total is user-visible pricing behavior. The risk is hiding a useful estimate; the benefit is avoiding presentation of a partial subtotal as a complete fare. Implementation should be a narrow V2 serialization/recovery guard with explicit tests for complete and incomplete evidence plus a supported fully priced route. It must not change tariff amounts, M4/M12 thresholds, road geometry, or route selection.
