# Codebase audit block 17 — GitHub Actions/CI — DONE — 26.10.2026 23:31 МСК

Branch fix/v3-missing-route-prices-2026-10-15, parent 1b971fe43186f961ff20681b87e2fbe307bd9379; PR14 Draft; Actions idle pre-write. Static read of special-territory-policy, calculator-final-gate, route-quality, systemic-toll-composition, B03 browser, B10 capture workflows. Branch protection read rejected 403 by GitHub connector; do not claim required-check configuration.

- special-territory verify is blocking and runs selected scripts TS tests, V2 capture validator, tsc and Next build. Live/timing jobs are conditional on changed-file classifier; uncertainty fails open (runs diagnostics), and these jobs are advisory via continue-on-error.
- calculator-final-gate targets PRs into main for code paths; runs pnpm build (custom full test:audit + Next build), lint, local production smoke and live route audits. Required status cannot be verified because branch-protection API denied access.
- B03/B10 workflows narrowly scoped to explicit workflow/script path changes; no run triggered.
- **AUD-CI-01 P2 confirmed environment mismatch:** package engine Node24.x, but scheduled route-quality and manual systemic composition workflows use Node22.13.0. Can create unsupported/inconsistent CI behavior; no failure reproduced. Recommend Node24 alignment and isolated CI validation. Small independent workflow fix.
- Many actions use floating major tags (e.g. checkout@v4, setup-node@v4); no malicious change found; immutable commit-SHA pinning/update automation is P3 hardening, optional.

Block done 17/18 (94.4%). No CI run or edits. Next B18 final synthesis and precise limitations.
