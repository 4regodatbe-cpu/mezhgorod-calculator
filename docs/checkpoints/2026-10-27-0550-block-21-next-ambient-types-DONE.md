# Reliability block21 — Next.js ambient fetch types — DONE — 27.10.2026 05:50 МСК

- Strict-test typecheck had three `RequestInit.next` errors in `lib/route-providers.ts`. Root application `tsc` had already passed; the standalone test config simply failed to load Next's global augmentation.
- Verified `node_modules/next/types/global.d.ts` declares `NextFetchRequestConfig` and augments `RequestInit.next`. Adding that file to the temporary config's `files` list removed all three errors without source edits.
- Strict diagnostics moved41→38; the remaining38 are in21 files. This is a checker-config correction, not three application defects. Temporary config was removed; no weakened or new CI gate.
- No test required for this config-only correction; `git diff --check` PASS. Overall progress21/24 (87.5%); block21 remains incomplete.
