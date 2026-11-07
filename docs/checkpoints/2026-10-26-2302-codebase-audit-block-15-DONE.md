# Codebase audit block 15 — dependencies/build/config — DONE — 26.10.2026 23:02 МСК

Branch fix/v3-missing-route-prices-2026-10-15, parent 56436125d51e816fc7ab6faa9e8468530a4f17ad; PR14 Draft; no active Actions pre-write. Read package.json, pnpm-lock.yaml importer/header, pnpm-workspace.yaml, tsconfig, Next and ESLint config. No install, build, CVE query or tests.

- Node 24.x, pnpm 11.25.0, frozen-lockfile CI install; lock format9 with integrity hashes. Some ranges resolve in lock. This does not establish current vulnerability status.
- Build invokes test:audit then next build; lint is separate. One workspace package; pnpm allowBuilds explicitly lists sharp/unrs-resolver. strictDepBuilds semantics not assessed.
- AUD-BUILD-01 P2 confirmed: tsconfig excludes scripts while test:audit executes TS tests through Node; those tests are not statically typechecked by project tsc. Recommend isolated no-emit test/script typecheck; low-medium tooling risk.

Block done 15/18 (83.3%). Next B16 static test and CI inventory.
