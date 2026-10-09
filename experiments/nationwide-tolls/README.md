## Latest nationwide result: 2026-10-09

Vercel **READY** at commit `6917191f`, `https://mezhgorod-calculator-pjfvyy2kq-4regodatbe-5310.vercel.app/v2`: **235/235 native Node tests PASS**, Next/TypeScript PASS, and real Moscow→Voronezh browser calculation shows national M4 candidate and **no new money charged**. Review `WORK_LOG.md` phase B and `START_HERE.md` for the exact distinction between 22 inventory networks / 8 partial operator-fare groups and 0 nationwide new live prices.

# Toll roads of Russia — implementation handoff
**Branch:** `experiment/toll-od-matrix-2026-10-08`. **Requested by user:** extend the calculator to all paid highways and regional toll roads of Russia, not only M-4. Full work journal is append-only.

## Modules
- `national-registry.json` — **22** named toll networks/operators, classification per network, precise source link, readiness state and **8** network-specific groups of operator example/category-I fare cells. Treat registry count as a current scoped inventory, not guaranteed complete national census.
- `national-price.mjs` — strict offline `quoteNationalRoad(catalog,request)` with metadata, same-route paid facility evidence, category I, no transponder, effective dates, exclusivity, time/holiday/taxi and MSD transit rules. `quoteNationwideTrip(catalog,trip)` composes multi-operator charges only if **all** selected-route tolls proved, else unknown. **Not used for final live money**.
- `national-preview.mjs` — preliminary route-family candidate detector: original geometric checkpoint names plus actual existing strict PVP/M11/M12/CKAD evidence. Does **not** establish physical toll crossing for every regional road or add money.
- `national-price.test.mjs` and `national-preview.test.mjs` — unit/contract regression.
- `SOURCE_AUDIT_2026-10-09.md` — links, exact supported fare examples and source limitations.
- `WORK_LOG.md`, `DECISIONS.md`, `NEXT_STEPS.md` — handoff, approved fail-closed rules, prioritized work to complete all networks.

## Running calculator Preview
- `lib/v2-calculation/route-leg-pricing.ts`: attaches `nationalTollCoverage` (diagnostic only) to selected route, while retaining M4/M11/M12/CKAD/A289 established composition and unknown handling.
- `lib/v2-calculation/route-leg.ts`: passes diagnostic to API JSON.
- `app/v2/components/result-panels.tsx`: collapsible **«Платные дороги России · проверка покрытия»**; nobody should mistake potential road-system name matching for charged gate.
- `app/v2/toll-roads/page.tsx`: readable 22-system catalog, direct operator-source links and statuses.
- `app/v2/page.tsx`: links to registry.
- `package.json`: Vercel preview build gate tests **both** standalone experiment suites before Next compile.
All code above lives on experimental Preview branch, without merging into `main`, PR #12 or publishing Production.

## Hard prerequisite to full nationwide automatic fare
Independent verified paid-edge/camera/entry-exit data **for each actual chosen route**, current operator tariff matrices across road/vehicle/payment/date, plus same-route integration test cases. Even a correct table is insufficient without crossing proof. Existing customer-facing old-price route calculations are not evidence that this new national module has priced anything.

See `NEXT_STEPS.md` and `docs/WORK_STATE.md` before new work. Append WORK_LOG after every completed major block.
