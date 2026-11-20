# B03 hosted address UI scenarios — run 40343852094

- Commit: `b0fc3deb311d49f9bac3dd0bb7d33345ac58bb0b`, allowed branch `fix/v3-missing-route-prices-2026-10-15`; PR #14 remained Draft.
- GitHub Actions: [run 40343852094](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40343852094), workflow `B03 address UI browser scenarios`.
- Result: 8/8 PASS, 0 FAIL, 0 NOT_RUN; runner exit code 0; zero blocked external browser requests; zero page and route errors. Per-case request counts and actual values are in `scenarios.json`.
- Environment: Ubuntu hosted runner; Node 24.21.0; Chrome for Testing 156.0.8078.47; Playwright 1.56.0; viewports 1280×900 and 320×720.
- Snapshot freshness checked at `2026-10-26T14:53:49.870Z`; snapshot ID `positive-cities-2026-10-24`; source expiry `2026-10-31T08:24:54Z`; records SHA-256 `98f0b3aff117d77525bcba9d65c4d507b1a29d540e0c9fdf553e5fb9494b2933`, verified by the harness.
- Artifact ID `12660732224`, 150,999 bytes, SHA-256 `41525a99b7889c574c107dd450c3cef052792b1d7a7c6e74cd0e2f49751f5662`, retained by GitHub Actions through `2026-11-25T14:54:08Z`; contains the mobile screenshot.

## Eight cases

1. **PASS** — Donetsk search returned the two distinct records without auto-selection; limited coverage notice and OSM copyright link visible. `/r` requests: 1.
2. **PASS** — Exact A/B labels, positions, `reviewed_city_snapshot` metadata and both notices retained through selection/calculation. `/r`: 2.
3. **PASS** — Result existed before swap; one swap button; full Place values and notices moved together; prior result disappeared. `/r`: 2.
4. **PASS** — Clear B removed old state; fresh Rostov request and selectable result. `/r`: 2.
5. **PASS** — Delayed Donetsk response did not replace the newer Krasnodar query or trigger page error. `/r`: 2.
6. **PASS** — Normal, empty, controlled 502 and retry behaved correctly; zero stale suggestion labels after 502, retry visible and issued one new request. `/r`: 4.
7. **PASS** — Repeated fallback issued fresh requests; ordinary positive Moscow cache avoided another request. `/r`: 3.
8. **PASS** — At 320×720, no horizontal overflow; dropdown, credit, clear and swap controls visible; keyboard selection preserved notice. `/r`: 1; screenshot `08-mobile-keyboard-mobile.png` is in the retained artifact.

Mocks intercepted `/r`, classification, calculation and collection; no external service was contacted. This confirms the tested UI behavior only; it is not live Photon availability nor proof that the original external B-only failure is fixed. `addressCitySnapshot` remains disabled.
