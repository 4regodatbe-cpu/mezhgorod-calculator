# Next steps

Priority-ordered actions for the next owner/agent. No publication is currently authorized.

1. **Obtain new first-party tariff evidence** for `avtodor-other-roads-2026-10-01-category1-transponder` and `avtodor-other-roads-2026-10-01-category1-no-transponder`. Verify the exact effective date and applicable products/categories, update only supported source rows, then rerun strict freshness. Do not extend freshness dates or thresholds without verification.
2. **After separate owner authorization, publish the isolated final-gate candidate by ordinary non-force fast-forward push** to `fix/v3-missing-route-prices-2026-10-15`. At preparation time remote head was `8fae15c7…`; recheck remote SHA and ancestry immediately before any write. Push is currently forbidden.
3. Inspect the GitHub Actions run triggered by that push on its exact SHA: offline checks, TypeScript, lint, production build, API smoke, V3 live route report and strict freshness. The route report is sanitized; distinguish HTTP 502/provider outage from application assertions. Do not call the gate green if either live or freshness step failed.
4. For Tver→Adler and Golubitskaya→Saint Petersburg, obtain provider-level logs/status from the hosted run or a reproducible provider diagnostic before deciding whether there is an application routing defect. No automatic retries or repeated live requests.
5. Leave Donetsk→Kazan and Moscow→Kazan toll status `unknown/null` until an independently proven directed M‑12 tariff boundary and current matching tariff pair exist.
6. Preserve PR #14 as Draft and do not change Production, main, Android, V2 runtime, or the protected primary local history as part of this stage.
