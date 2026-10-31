# Reliability block16 — diagnostics and privacy — DONE — 27.10.2026 03:40 МСК

- Parent `c4bc4be85f5989822816ac83391b155ccd2407c6`; allowed branch only, PR14 Draft; no parent Actions runs.
- Reviewed structured diagnostics: `/api/suggest` logs only bounded elapsed/source counts, failure-category counts, budget flag and reviewed snapshot ID/item count; it does not log query or URL. Photon failure labels are allowlisted. Calculation timing is opt-in and emits fixed stage names/counts/durations/stops only, without route/address data. `/api/collect` removes street/house components, has16KiB body cap and8s webhook deadline; errors are generic.
- Reproduced a client error-detail exposure in `app/v2/error.tsx`: production render included raw exception text and digest despite the “test-only” label, and the effect logged the raw `Error` object.
- Minimal fix: render technical details only when `NODE_ENV !== production`; structured console log now contains only a digest or `unavailable`, never raw exception text. No changes to server API messages or calculation behavior.
- Test-first RED: `scripts/v2-error-boundary-safe.test.mjs` production case failed before fix. GREEN: production hides message/digest; development retains explicit debug details;2/2 PASS. `npx tsc --noEmit`, scoped ESLint and `git diff --check` PASS. No external service or browser run.
- No broader personal-data audit of external logging vendors was possible from repository code; current app-side log fields reviewed above. Next: block21 strict typecheck feasibility for scripts/tests.
