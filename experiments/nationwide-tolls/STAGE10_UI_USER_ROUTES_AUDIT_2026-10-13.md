# Stage10 in progress — requested UI and screenshot routes, 2026-10-13

User asked: approved «из А в Б» logo, centre city swap, larger/centred ₽/км, filled circular increment and outline circular decrement controls, Calculate disabled until A/B entered, remove «единственный допустимый», investigate missing road fees for screenshot routes. Baseline local1a02b81, remote3ce874f365e4647e7a1cce49ccd1646d37ac71f9 checked unchanged; unrelated PRs12/9/6 unchanged. No main/merge/Production.

## Implemented

- `public/izavb-approved-logo.svg` copied byte-for-byte from existing portal working source `/workspace/scratch/f8c8d11baabe/portal-work/apps/web/preview/assets/logo.svg`. Prior approved variant2: navy text, lower orange line/two markers, no upper line. Replaced V3 Car placeholder with this asset via Next Image; accessible h1 remains. No new logo invented.
- V3 swap exchanges whole Place objects (labels AND positions), cancels/clears old results. Desktop centre control between A/B, stacked mobile control between fields. Shared form only renders swap when handler exists; V2 gets no dead control.
- CTA desktop/mobile disabled for empty/whitespace labels or loading. Typed addresses can still be geocoded by API; no artificial requirement to choose a suggestion added.
- Rate/unit22px/17px, centred in the available column, circle-filled upper stepper/circle-outline lower stepper. Do not span across the decrement button column (initial draft overlap corrected).
- Ordinary V3 route note now «Выбран маршрут с минимальным временем». Unknown road fare has a prominent card-owned note that the full trip total is unknown; base fare remains labelled without roads.
- Proven calculation bug: `recoverCorridorTolls` can sum just two approximate M12 segments and produce995 as matched. V3 local/remote recovery now retains those segments as diagnostics with zero internal sentinel and null/unknown API fare, not a full charge. Matrices/strict road engines and A289620/415 unchanged. V2 legacy recovery unchanged.

## Corrected earlier assumptions

Earlier uncommitted A289 alias detection and direct-price override were speculative, unsupported by a failing example, and could suppress a road candidate. They were fully removed before final tests. Earlier commentary asserting A289 alias as the root cause was incorrect. Existing saved live A289 controls already returned620/415. Current proven issue is subset recovery, not a missing A289 tariff.

## Screenshot comparison / actual fresh API-handler runs

Screenshots are user-provided Yandex UI observations, not authoritative billing tables. API uses representative city coordinates, not guaranteed identical addresses/traffic/departure minute. All external providers actual, not mocked. Full raw geometry was not archived in this block; final Ufa API body/provider summaries retained in `live-controls/2026-10-13-stage10-ui-ufa-moscow.json`. Replay runner `scripts/v3-live-user-routes-audit.mjs [case-name]`.

| Route | Screenshot fastest | Actual API chosen | Road amount / reason |
|---|---|---|---|
| Ufa→Moscow |1330km,13h52,~6720₽ (other paid choice~5909)|Valhalla1315.853km,63893s (17h44m53s)|Before995 subset recovery; finalnull unknown, same selected distance/time. Final measured39162ms; screenshot fare not imported.|
| Petersburg→Moscow |710km,7h18,~5630₽|Valhalla718.376km,24952s (6h55m52s),11410ms|null, `m11_northbound_sequence_not_proven`: full geometry head engine supports northbound and Tver southbound, not complete Petersburg southbound. Separate679–684 remains unresolved.|
| Petersburg→Sevastopol |2590km,30h03,~11899₽|OSRM2591.826km,122968s (34h09m28s),34467ms|null, unresolved full M4/A289 and M11; Valhalla/BRouter400 for controlled corridor.|

Distances look similar but durations differ substantially. No ≤3% Yandex equivalence claim. Earlier discussion suggesting Ufa time was17 minutes faster was incorrect: API17h45 vs Yandex13h52. Display unknown does not fix source/physical completeness; the requested full numeric tariffs for these three routes remain OPEN.

## Verification actually run

Focused final12 tests PASS, including actual React static form render (CTA blank/typed addresses and swap rendered) and actual recovery+V3 regression proving legacy995 becomes null unknown. Full `npm run build -- --webpack`:530/pass530/fail0, quote/API contracts PASS, TypeScript and Next16/16 PASS. Scoped ESLint/diff-check PASS. First focused command omitted TS loader and failed module resolution; corrected command with register-ts-paths passed. React skill review: accessible labels/button types/logo alt, no new hook/dependency, swap/reset consistency, static asset dimensions.

Local Next startup default hostname failed `uv_interface_addresses`; explicit127.0.0.1:3101 started successfully. Playwright installed but Chromium executable absent, no system browser found; browser script could not launch. No screenshot visual QA, real browser swap/click/system clipboard or hosted POST claimed. Previous final UI draft530 tests/build ran after final source edits; live replay helper changed only afterwards (not runtime). Actual API-handler calls bypass Next HTTP transport, not hosted browser tests.

## Next work

1. Publish/check exact experimental Preview source; persist SHA/logs/availability checkpoint.
2. Complete directed M11 southbound head/mainline +679–684 physical/source model before numeric Petersburg fares; extend actual M12 complete selected-route boundaries/current versions for Ufa. Do not copy screenshot amounts to other geometry or revive subsets.
3. Obtain a working browser runtime for real desktop/mobile layout and client→API verification; compare same endpoint/date/profile selected Yandex route, then complete stage10 performance/coverage report. Stage10 remains IN PROGRESS; nationwide audit not complete.
