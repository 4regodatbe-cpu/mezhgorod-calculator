# Технический аудит репозитория «Из А в Б»

Статус IN_PROGRESS; новый план — 18 блоков. Source: remote `fix/v3-missing-route-prices-2026-10-15`, baseline `f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d`. Read-only source/evidence review; no application, pricing or business-rule changes. Progress percent applies only to this audit.

## Progress

18 blocks: 1 architecture; 2 address lookup; 3 cache/pool/cancel; 4 API inputs; 5 providers; 6 selection; 7 saved V2/V3 evidence; 8 geometry/boundaries; 9 tariff composition; 10 V2 UI; 11 V3 UI; 12 API output/errors; 13 security; 14 performance; 15 dependencies/build; 16 test quality; 17 CI; 18 docs/data governance/synthesis. Done: 10/18 (55.6%). Last: [B10 checkpoint](checkpoints/2026-10-26-2210-codebase-audit-block-10-DONE.md). No tests/build/browser/live requests in this audit.

## Saved V2/V3 evidence (reports only)

Eisk V2−V3: Thu −1m/0s/+580₽; Sat −1m/0s/+1,530₽. Maykop: Thu/Sat −1m/0s/0₽. Capture SHAs and limits are recorded in [B7](checkpoints/2026-10-26-2143-codebase-audit-block-07-DONE.md). These are proxy outputs, not operator fare verification.

## Findings

### P2 — probable/unverified

- **AUD-GEOCODE-01:** direct Photon label geocode has no local deadline; may hold request until platform timeout. No timeout reproduced. Bounded transport/abort regression recommended, isolated.
- **AUD-API-01:** calculate endpoints have no explicit app-level request byte/label cap. Platform caps/exploitability unverified; shared validator recommended.
- **AUD-PROVIDER-01:** provider JSON responses are parsed without explicit app byte cap; upstream constraints unknown. Risk only.
- **AUD-TEST-01:** V3 explicitly rejects invalid route geometry; equivalent V2 regression not found, though public V2 paths reject missing plan controls. Coverage/defense-in-depth gap, not proven output defect.
- **AUD-TRACE-RECOVERY-01:** partial trace with a toll edge has `status:toll, complete:false`; recovery uses that status to lower geometric segment threshold (M4 2 vs4, M12 2 vs5) and may emit a matched amount from matching segments. Potential partial/subtotal classification risk; not reproduced and geometry still independently matches corridor. Recommend focused complete/partial-trace fixtures, then define policy. Medium fix risk (could increase unknown outcomes), isolated to recovery evidence contract.
- **AUD-UI-01:** V2 calculation hook stores pending AbortController, cancels previous calculation/new form clear, but no unmount cleanup is present in `use-v2-calculation.ts:25,70–74,143`; `app/v2/page.tsx` uses hook without cleanup. On SPA unmount an in-flight API request could continue consuming server/provider work. No runtime reproduced; browser not run. Recommend cleanup on unmount and a focused hook test. Low risk, isolated hook lifecycle change.

No P0/P1 confirmed. Earlier provisional V2 empty geometry P1 was withdrawn after controls-path review.

## B10 V2 UI review

`app/v2/components/address-field.tsx` uses 350ms debounce, cache, AbortController cleanup, checks `signal.aborted` before applying response, and exposes retry/error/empty/live status. Input maxLength 200 and suggestion controls are keyboard-native buttons; snapshot source is visibly labeled. No race/accessibility issue proven from inspection. `use-v2-calculation.ts` aborts old requests on new call and `clearResult`; telemetry failure is isolated. Only unmount cancellation is the probable lifecycle risk above.

## Not reviewed

Blocks 11–18: V3 UI, API response contract, security/privacy, perf/memory, dependencies/build, tests, CI and governance. No tests/build/browser/live requests; no road/fare audit repeated.

## Next

B11 statically inspect V3 address/calculation state and error lifecycle; no browser tests.
