# Reliability block21 — generic API tolls property preservation — DONE — 27.10.2026 06:10 МСК

- Parent remote was read back before work; allowed branch only; PR14 Draft; no active Actions.
- Made `tollsForApi` generic over its `TollEstimate` input and preserved extra properties through the existing object spread in the return type. This fixes four test type errors where V3's `priceConfirmation` extension survived at runtime but was hidden by the narrower V2 wrapper type. No runtime expression or assertion changed.
- Four focused saved/offline tests PASS: CKAD own price, CKAD+M11/M12 missing composition, M11 p258, and Odintsovo pair. App `npx tsc --noEmit` PASS; targeted ESLint and diff check PASS.
- Strict scripts/tests diagnostic count moved38→34. Correct recount: 34 errors across16 files (earlier ambient-type checkpoint said21 files; three Next diagnostics were false positives and the route-provider file then left the set). No `priceConfirmation` errors remain in these four tests; one separate stale property error persists in another test and is not addressed here.
- Temporary strict config with Next ambient declarations was removed. Overall scripts/tests gate remains incomplete and is not enabled in CI. Progress21/24 (87.5%).
