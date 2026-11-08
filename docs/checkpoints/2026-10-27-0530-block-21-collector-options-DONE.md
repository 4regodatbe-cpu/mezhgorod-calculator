# Reliability block21 — collector options mock group 2 — DONE — 27.10.2026 05:30 МСК

- Parent branch/readback was confirmed before this group; allowed branch only; PR14 Draft; no active Actions.
- In `scripts/address-runtime-probe.test.ts`, aligned the non-cooperative collector mock with the callable contract: the options object and `signal` may be absent. The test now records `input?.signal`; its never-resolving promise is typed `Promise<never>`. Production code and timeout behavior are unchanged.
- Strict scripts/tests typecheck before group:46 diagnostics/23 files; after:45/22, with none in the edited file. Test command `node --import ./scripts/register-ts-paths.mjs --test scripts/address-runtime-probe.test.ts`:1/1 PASS. Scoped ESLint and `git diff --check` PASS.
- Temporary strict config removed; the overall gate remains unadopted and block21 remains in progress. Overall reliability progress21/24 (87.5%).
