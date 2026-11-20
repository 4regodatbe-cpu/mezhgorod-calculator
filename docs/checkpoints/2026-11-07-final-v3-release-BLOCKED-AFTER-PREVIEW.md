# FINAL V3 — hosted acceptance blocked after push

Date: 2026-11-07 UTC  
Candidate source: local branch `codex/stage-ae-gate-proposal`  
Pushed release-gate SHA: `76a39da28a5fefa7aa7ec0f2c954114297d84b06`  
PR #14: OPEN / Draft  
Production before and after this task: `a6bea89dd4b481a1352dc492969004e6cd1e6e38`

## Publication and exact-SHA checks

The owner authorized applying the reviewed product-evidence tariff gate and completing the release sequence on success. Pre-push ancestry/diff checks passed; an ordinary non-force fast-forward push advanced the allowed branch from `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb` to `76a39da28a5fefa7aa7ec0f2c954114297d84b06`. GitHub branch readback and fetched workflow/script readback matched the commit. No force push, merge, main, Android, backup-ref or Production mutation occurred. PR #14 remains Draft.

## GitHub Actions

| Workflow / run | Result | Evidence |
|---|---|---|
| Calculator final gate `42422534603` (push) | SUCCESS | Exact candidate SHA; job completed successfully. |
| Calculator final gate `42422528950` (PR) | SUCCESS | Exact candidate SHA; job completed successfully. |
| Route quality/offline benchmark `42422528855` | SUCCESS | Exact candidate SHA. |
| B03 address UI browser `42422534580` | FAILURE before browser | Freshness step returned exit 2: `BLOCKED_BY_EXPIRED_SNAPSHOT expiresAt=2026-11-07T14:50:17.541Z`. Browser suite skipped; no scenario artifact. No freshness rule/data was weakened. |
| Special territory geometry/pricing `42422534610` | FAILURE in live probe | Donetsk address probe `SOURCE_UNAVAILABLE`, four HTTP 503 responses, three cooldown decisions, zero features. Rostov and Krasnodar passed with intermittent 503/cooldowns. Calculation timing and other jobs passed. |

Hosted runtime smoke from the exact-SHA workflow: Donetsk→Moscow HTTP 200, distance 1,123.249 km, duration 58,337 seconds, toll status `unknown`, toll amount `null`; this preserves uncertainty rather than fabricating a tariff.

## Vercel Preview

- Deployment: `dpl_AsqF7RmhBU6kU7TBjpjYQmjhvR2w` — READY, commit `76a39da28a5fefa7aa7ec0f2c954114297d84b06`.
- Preview URL: `https://mezhgorod-calculator-cw2oeu036-4regodatbe-5310.vercel.app/v3`.
- `/api/version`: HTTP 200, exact commit, environment `preview`.
- `/v3` and `/v2`: HTTP 200. Accessibility tree showed address fields, calculate control, mode controls and Android link; this is not a route submission.
- Read-only `/api/suggest` GETs: HTTP 200 for Yalta, Volnovakha, Donetsk, Melitopol, Krasnodar and Rostov. Yalta-Crimea was the first match; Donetsk DNR came first; Ростов-на-Дону came first while Ростов Великий remained available.
- The available browser connector could navigate and inspect the accessibility tree but has no input/click operation. Its extension explicitly rejected JavaScript-URL navigation; no policy bypass was attempted. Therefore end-to-end route calculation in Preview is **NOT VERIFIED**.

## Decision

Do **not** publish Production. The exact-SHA preview exists and the final tariff gate passes, but the required browser acceptance did not run because its independently controlled seven-day source snapshot expired. A separate live address probe also encountered real external Photon 503/cooldown for Donetsk. These are explicit release blockers; the Production deployment was read back unchanged at `a6bea89…`.

Next action: obtain fresh, genuine source captures for the existing limited snapshot entries with preserved timestamps, IDs, coordinates and hashes; never change the old expiry manually. Then rerun B03 and perform a real Preview route submission with a browser driver capable of input/clicks. If the external Donetsk probe remains unavailable, keep that failure separate from application behavior and require a successful real Preview route before promotion.

This checkpoint is documentation closeout after the pushed candidate; it is not part of remote SHA `76a39da…` and was not published.
