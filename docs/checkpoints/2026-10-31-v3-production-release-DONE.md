# 2026-10-31 — V3 Production release DONE (owner authorized)

Status: DONE for Production launch; optional Photon and browser E2E limitations retained explicitly.

Owner decision: accepted RC1 on phone; publish V3 now as a working Production tool, defer UI enhancements. No merge/main/Android/backup changes were authorized or performed.

Reviewed GitHub branch: `fix/v3-missing-route-prices-2026-10-15`, code release SHA `e3ca3783a8ba9de3271851959eba213bf7a76868`; PR #14 OPEN/Draft, unmerged. Prior RC1 preview SHA `cde74243c88cfab313913d8b0435e8d56fae372e`. New source difference is narrowly scoped to explicit Production GeoNames admission, targeted tests and checkpoint documentation. Core route selection, toll engine, tariff matrix, V3 UI, V2 remain unchanged.

## Changes
- `lib/local-settlement-search.ts`: retain `GEONAMES_LOCAL_PILOT=1` default-off gate; when `VERCEL_ENV=production`, require additional explicit `GEONAMES_PRODUCTION_ENABLED=1`. Preview remains restricted to approved exact branch. No client-controlled enable.
- `scripts/geonames-production-gate.test.ts`: regression of both flags, default deny, preview branch and unknown environment protections.
- Vercel project `prj_JbuIKFQNjD3FvAcX2I65Dm5OBKie` / team `team_UFuw0UGXjMqBV2hJBxsWGAMS`: `GEONAMES_LOCAL_PILOT=1` and `GEONAMES_PRODUCTION_ENABLED=1`, target Production ONLY. Preview branch-specific flag preserved, `V3_TOLL_ESTIMATE` absent/OFF, snapshot feature flag remains false.
- Production deployment `dpl_E3e6gUCSd9izZ8tKHA9tf85fr115`, git SHA `e3ca3783a8ba9de3271851959eba213bf7a76868`, READY/production, served by `https://mezhgorod-calculator.vercel.app`. Vercel hostname lookup confirms alias points to this exact deployment.
- Rollback baseline: former READY production deployment `dpl_6XMRbMu5V5vqWTzf684oPTMyubju` (SHA `051d51ea4e4e40b21245af4f7e21b2fea4c4f00f`), still available as candidate. Do not roll back unless needed.

## Actual verification
- GitHub Actions B03 workflow run 41227796327: SUCCESS, verify/address-ui PASS.
- Special territory workflow run 41227796326: overall SUCCESS; required verify, classify_live_scope, calculation_timing PASS. Verified offline gate report: 1067 PASS / 0 FAIL / 1 SKIP. **Optional live_probe job FAILED**, reason: old Photon address collector timed out on `Донецк` (`QUERY_TIMEOUT/deadline`). Earlier `Ростов` and `Красн` passed with some HTTP 503/cooldown. This job is separate from the GeoNames-first public API and must not be claimed as PASS.
- Exact new Preview build READY and direct HTTP GET /v3, /api/suggest?q=Мелитополь, /api/suggest?q=Мариуполь ->200, GeoNames.
- Exact Production deployment READY, `/v3` HTTP 200, `/v2` HTTP 200. Six Production `/api/suggest` GETs all returned HTTP 200 and provider GeoNames: Мелитополь — Запорожская область, Мариуполь — ДНР first (`partial:true`), Донецк — ДНР first, Волноваха — ДНР, Краснодар — Краснодарский край first, Анапа — Краснодарский край. User-approved prior Preview mobile calculations remain acceptance evidence, **new Production browser interaction and live POST calculation NOT independently executed** in this chat.
- Vercel error/fatal runtime logs filtered to new deployment for latest 20m: no matching logs found at check time; not a guarantee of no future errors.

## Operational status
The public V3 can be used now, with GeoNames independent city suggestions and legacy V2 available. Toll unknown/null, operator tariff gaps, optional overlay OFF and external Photon 503 remain known, explicitly scoped limitations. UI enhancements deferred as requested. No new broad live route audits performed. No protections disabled, no secrets displayed, no PR merge, no force push, no Android/main/backup changes.

For further Codex work: its old local-only checkpoint `06c17540` was not in remote on release start. Before making changes, inspect actual remote head and rebase/cherry-pick any necessary local-only documents without rewriting Production history. This documentation-only receipt does not alter the already deployed Production source SHA.

Next: monitor normal usage and capture user-reported UI improvements separately; reclassify if the main user journey actually fails, do not reopen completed release audits by default.
