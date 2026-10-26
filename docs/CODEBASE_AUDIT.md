# Технический аудит репозитория «Из А в Б»

Статус IN_PROGRESS; 18-block audit; remote branch `fix/v3-missing-route-prices-2026-10-15`, source baseline `f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d`. Статический review кода и сохранённых evidence; application behavior, tariffs and CI not changed. Процент — только по этому аудиту.

## Прогресс

1 architecture; 2 address lookup; 3 cache/pool/cancel; 4 API input/call graph; 5 providers; 6 selection; 7 saved V2/V3 captures; 8 geometry/boundaries; 9 tariff composition; 10 V2 UI; 11 V3 UI; 12 API outputs; 13 security; 14 performance; 15 deps/build; 16 tests; 17 CI; 18 docs/data governance. Выполнено 11/18 (61.1%). Последний [B11 checkpoint](checkpoints/2026-10-26-2218-codebase-audit-block-11-DONE.md). Тесты, browser, build, live requests не запускались.

## Сохранённые V2/V3 выходы — без повторного replay

Ейск Thu −1м/0с/+580₽, Sat −1м/0с/+1,530₽; Майкоп Thu/Sat −1м/0с/0₽. Это proxy/API output, не независимое подтверждение тарифа; source hashes есть в [B7](checkpoints/2026-10-26-2143-codebase-audit-block-07-DONE.md).

## Findings — P2 candidates, no reproduced defect

- **AUD-GEOCODE-01:** direct Photon label geocode lacks a local timeout; downstream slow-request risk untested. Fix proposal: bounded transport/abort regression; isolated.
- **AUD-API-01:** no explicit app-level calculate request bytes/label length caps; platform protection unknown. Add shared validator only after platform constraints checked.
- **AUD-PROVIDER-01:** JSON provider response parsed without explicit application byte cap; upstream limits not verified.
- **AUD-TEST-01:** V2 lacks explicitly found invalid geometry regression; public paths reject missing plan controls. Coverage/defense-in-depth, not shown output defect.
- **AUD-TRACE-RECOVERY-01:** partial trace status=toll can lower recovery segment-run threshold (M4 2 vs4, M12 2 vs5) and matched subtotal may serialize priced. Static possibility only; requires geometry too. Add partial/complete-trace fixtures before behavioral change.
- **AUD-UI-01:** `app/v2/components/use-v2-calculation.ts:25,70–74,143` has request abort on superseding call/clear but no hook unmount cleanup. SPA navigation may leave request work in flight. Not reproduced; low-risk isolated hook cleanup + focused test recommended.

No P0/P1 confirmed. Initial V2 empty-geometry issue withdrawn after B6 because all reviewed API paths require ordered plan controls.

## UI evidence (B10–B11)

V2 address field debounces 350ms, aborts stale suggestion fetches and ignores aborted responses; shows empty/error/loading/retry. V2 calculation validates basic response shape, aborts previous or cleared requests, but has no unmount cleanup. V3 shares AddressField and uses `use-v3-calculation.ts` unmount cleanup for active calculation/copy timer. `response-validation.ts` checks positive route totals, monetary safe integers/null semantics, pricing segment sums, exactly one leg and matching option/result fields. No runtime/browser verification performed.

## Не проверено

Блоки 12–18: API error/status contract, security/privacy, perf/memory/external request budgets, dependency/build config, test effectiveness, CI, docs/data governance. No test/build/browser/live runs and no route audits repeated.

## Следующий шаг

B12 static API output/error review: compare V2/V3/legacy status and validation semantics, unknown toll serialization and malformed/upstream error boundaries; no requests.
