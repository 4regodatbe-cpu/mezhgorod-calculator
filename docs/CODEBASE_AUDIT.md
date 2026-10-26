# Технический аудит репозитория «Из А в Б»

IN_PROGRESS; план 18 блоков. Источник — удалённая разрешённая ветка, baseline f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d. Анализ read-only; код, тарифы, CI и Production не менялись. Не запускались тесты, build, browser или live requests. Процент только этого аудита.

## Прогресс

1 architecture; 2 address; 3 cache/cancel; 4 API input; 5 providers; 6 selection; 7 saved V2/V3; 8 geometry; 9 pricing; 10 V2 UI; 11 V3 UI; 12 API outputs; 13 security; 14 performance; 15 deps/build; 16 tests; 17 CI; 18 governance/synthesis. Done 15/18 (83.3%). [B15 checkpoint](checkpoints/2026-10-26-2302-codebase-audit-block-15-DONE.md).

## Сохранённые V2/V3 outputs

Ейск V2−V3: Thu +580₽/−1m/0s, Sat +1,530₽/−1m/0s. Майкоп: Thu/Sat 0₽/−1m/0s. Только proxy/API results, не независимое подтверждение тарифов. Подробные SHA в B7.

## Находки

Все ниже P2; кроме помеченных confirmed, это вероятные риски, не воспроизведённые runtime-дефекты.

- AUD-GEOCODE-01: direct Photon label geocode без локального deadline; медленный вызов может удерживать handler. Нет воспроизведения. Предложение: bounded transport + abort test.
- AUD-API-01: нет явных app-level лимитов body bytes/label length в calculate API; deploy/platform caps неизвестны.
- AUD-PROVIDER-01: route adapter напрямую парсит JSON без app-level byte cap; реальные upstream limits не установлены.
- AUD-TEST-01: V2 invalid geometry regression не найден; public V2 path пустую geometry отклоняет через route controls. Это coverage gap, не доказанная неверная цена.
- AUD-TRACE-RECOVERY-01: неполный trace с toll edge получает status=toll; recovery снижает порог геометрического run (M4 2/4, M12 2/5) и может вернуть matched сумму совпавших сегментов. Плаузибельный partial-total риск, не воспроизведён; сначала создать изолированные fixtures. Средний риск поведенческого исправления.
- AUD-UI-01: V2 use-v2-calculation.ts:25,70–74,143 aborts при новом запросе/clear, но не при unmount; возможна лишняя backend работа. V3 cleanup уже имеет.
- AUD-DATE-01, confirmed mismatch: V2 route.ts:48 только проверяет Date parse; нормализуемая невозможная дата и timestamp без зоны принимаются. V3 валидирует календарь/zone. Поскольку дата влияет на toll period, прямой malformed V2 API input может выбрать другой период; UI шлёт ISO. Предложение: общий strict validator + tests; низкий/средний риск.
- AUD-ERROR-01, confirmed contract weakness: V2 route.ts:97 и V3:132 все ошибки без суффикса UNAVAILABLE классифицируют как 400, включая неожиданные серверные. Рекомендуется типизированное разделение 400/502/500.
- AUD-SEC-01: public /api/collect парсит JSON до field truncation, явных body/rate limit и timeout для webhook не видно. Abuse не проверялся; сначала подтвердить edge protections.
- AUD-BUILD-01, confirmed validation gap: tsconfig исключает scripts, но test:audit выполняет TypeScript tests через Node, не typecheck. Рекомендуется отдельный no-emit tsconfig/CI typecheck; tooling-only, низкий/средний риск.

Подтверждённых P0/P1 пока нет. Предположение о V2 empty geometry P1 снято: публичные пути требуют route controls и отклоняют отсутствие control coordinates.

## Performance/security and safeguards reviewed

Address pool ограничивает concurrency/queue/cache; route providers timeout/revalidate; trace sampler cap320 points, chunks140km, concurrency2, bounded 429 retry, per-chunk timeout18s. Total worst-case under Vercel maxDuration120 не измерялся. Timing target10s observational only. Suggest API caps; debug routes gated by token on Vercel, suggest q<=200 and bounded service. Collect handler has field coarsening but no visible pre-parse body cap/rate/deadline.

V3 UI strictly validates response schema and cleans up abort/timer on unmount; V2 validates a minimum shape and lacks unmount abort. Saved Eisk/Maykop comparisons are proxy data only.

## Осталось непроверенным

Blocks16–18: test adequacy/oracles; workflow required checks/triggers; data governance and final synthesis. Не запускались build/test/security scan/network/browser. Никакой новый дорожный аудит не выполнялся.

## Следующий этап

B16 статически инвентаризировать test files, relevant assertions and CI wiring, without running suite.