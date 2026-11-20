# AUD-TRACE-RECOVERY-01 — partial trace and corridor recovery

Status: behavior reproduced in an isolated offline helper/serialization path; actual route/user incidence not established. Source snapshot: allowed branch commit ee8d14bdcb869eeb74041c728167337765ea137f. No recovery rule or fare amount changed.

## Evidence chain

- lib/toll-validator.ts:317-338 returns status "toll" if at least one toll edge was observed, while also returning complete:false and boothEventCoverage:"partial" when some trace chunks failed.
- lib/toll-recovery.ts:101-103,117 treats status === "toll" as map-matched evidence, without testing complete/coverage. This selects lower minimum adjacent section runs: lib/toll-recovery-data.ts:62-63 has M4 2 versus 4 and M12 2 versus 5.
- Offline reproducer used the existing synthetic M12 geometry from scripts/v3-unpriced-coverage-audit.test.ts with an explicitly partial validation (checkedChunkCount=1, chunkCount=2, failedChunkCount=1, complete=false, boothEventCoverage="partial"). recoverCorridorTolls returned an internal helper amount of 995 for two approximate M12 sections. This is a fixture/output of the repository recovery table, not an official fare or actual captured route price.
- lib/v2-calculation/route-leg-pricing.ts:144-148 can choose that recovery result; lib/v2-calculation/route-leg.ts:137 serializes it through tollsForApi. lib/v2-calculation/free-route-selection.ts:48-58 marks any positive amount pricingStatus:"priced" before checking trace status/completeness. Thus the isolated path yields priced even though validation is incomplete.
- V3 currently wraps recovered fragments in unknown/diagnostic-only toll output (lib/v3-calculation/route-leg-pricing.ts:241-247). The existing scripts/v3-unpriced-coverage-audit.test.ts regression uses complete validation; repository search found no dedicated partial-trace recovery test.

## Assessment and recommendation

The evidence confirms a V2 helper/serialization risk for synthetic partial-trace input; it does not prove an actual user route has been overcharged. V3 currently fails closed for approximate recovered fragments. Before changing thresholds or business behavior, add a focused test for incomplete map-match metadata and review whether partial geometry may be used for diagnostics only. If revised later, keep the public full-fare status unknown unless route-wide sufficiency is proven. Preserve the existing M4/M12 thresholds until a separate approved change has independent evidence.

No route capture or live route case was run as part of the recovery analysis. A separate, unintended hosted probe caused by cumulative PR workflow filtering is documented in the checkpoint; it did not execute the 50-settlement/Yandex corpus. No code, tariff, or recovery data changed.
