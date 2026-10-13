# Endpoint-only implementation — 2026-10-13

User repeated and required: one continuous toll-road journey, first/last tariff boundaries, no intermediate exit/re-entry analysis, ready matrix cell. Local branch integration/matrix-estimates-2026-10-13; policy commit5a660cc; remote parent49e1da08 verified. Runtime reconnected and previous uncommitted availability work recovered.

## Implemented

V3 calculateLegTolls now calls resolveSelectedM4Endpoints, not calculateProductionM4/calculateM4Core. Boundary search starts from both route ends, rejects nearby free-ramp candidates until finding each actual paid boundary, stops on confirmed or unknown, does not validate the interior. Cached boundary checks avoid duplicate single-section requests. Existing all-PVP validation is retained for older consumers, not V3 final pricing. No native sum in new M4 production result (tolls:null); only ready matrix lookup can produce its fare.

Existing stored candidate fares are re-indexed by outer boundaries, deduplicating identical amount/source/version cells without adding money. Conflicting prices for the same endpoints fail explicitly as m4_endpoint_matrix_ambiguous-fare-version. Direct south matrix rows support both directions and single sections. Source/calendar/unknown guards retained. No arbitrary tariff winner.

M11 V3 no longer scans geometry for intermediate gaps/repeated crossings. Malformed input and actual endpoint/product mapping still matter; head and679–684 remain separate tariff products. M12 providers additionally expose an endpoint span spanning first/last strict road labels; V3 uses it. Exact OSRM step-chain/overview equality remains required. Older single-span evidence remains available to older consumers, deliberately distinct from new user policy.

Prior recovered work includes stable road-specific overnight tariff windows, OSRM M12 metadata, diagnostic serialization and live source archives. Native per-PVP M4 remains legacy compatibility only; prior3050 live result used that legacy mechanism and must not be presented as proof of new endpoint pricing.

## Actual verification

npm run build -- --webpack:540 tests/pass540/fail0, quote/API contracts PASS, TypeScript5.0s, Next16/16 PASS. Scoped ESLint PASS (npm environment warning only), git diff --check PASS. Tests cover M4 only2 boundary checks when valid, both directions, single-section direct lookup, missing/conflicting cell unknown, M11 same endpoint fare despite internal metadata gap, M12 endpoint span with exact overview binding. No browser/hosted POST/Production.

Fresh actual external-provider local V3 handler POST Volnovakha→Moscow:OSRM1182425m/61701s, elapsed30356ms, unknown due m4_endpoint_matrix_ambiguous-fare-version. Boundary resolution succeeded; this is now a tariff-table ambiguity, not unfinished intermediate checks. First attempted fixed-two-nearby-candidates version failed because one was a free ramp; corrected boundary search and repeated live control. Full price is NOT fixed, and no all-roads completion claim. Saved live metadata and gzip provider geometry in live-controls/2026-10-13-stage10-ui-volnovakha-moscow.*.

## Next

Resolve endpoint table conflicts from actual direct operator tariffs without selecting arbitrary internal chains. Complete missing M11 head/tail, M12 eastern products and CKAD M7↔M11 boundary mapping. User goal remains IN PROGRESS, stage10 not complete. Publish only experimental Preview after verified persistence; main/Production untouched.
