# DONE — bounded address-search live probe

Source e3c07ac3e09e8be1bbecd482b70974c691681f2b; durable STARTED925c8c4d172268bada71a0fef5bfbaa75843f94c/tree03ab6cf0f80bad1249daac9372bc04c18e946af1. Единственная веткаfix/v3-missing-route-prices-2026-10-15, PR14draft. Source CI39067254489 completed/success. STARTED6path+head readback PASS после однократного immediate mismatch без повторной записи; docs-only skipci не запускал новый широкий live-аудит.

## Изменено и зачем

- scripts/bounded-json-fetch.mjs: deadline запроса и чтенияJSON10с либо меньший оставшийся общий budget; monotonic clock, AbortController+Promise.race, очистка таймера и отмена непрочитанного тела при ошибке. Источник, игнорирующий abort, не блокирует ожидание.
- scripts/address-search-live-probe.mjs: общий budget90с, прекращение новых городов при его исчерпании; sourceErrors; atomic array/progress JSON после каждого города. Старый основной array contract и ranking сохранены. Budget exhaustion явноBUDGET_EXHAUSTED+CLIexit1, включая последнюю попытку; оставшиеся queries и неуспешные sources сохранены. DONE означает законченный набор попыток, не внешнюю доступность источников; failedSources остаётся явным.
- .github/workflows/special-territory-policy.yml: одна дополнительная строка artifact path address-search-live-probe-progress.json. scripts/address-probe-timeout.test.ts:8offline fault/contract tests с injected fetch. App/lib/матрица/ставки не менялись.

## Проверки и ошибки

Focused8/8, audit744/744,quote/API PASS,TypeScript exit0,ESLint exit0,Next build16/16 exit0. Команды: node --import ./scripts/register-ts-paths.mjs --test scripts/address-probe-timeout.test.ts; npm run test:audit; node node_modules/typescript/bin/tsc --noEmit; node node_modules/eslint/bin/eslint.js <три probe/helper/test файла>; node node_modules/next/dist/bin/next build. Каждый процесс имел внешний limit30/60/90с; exact arguments/exit/time в required-checks.json.

Initial focused failure — сравнение JSON с объектом, содержащим undefined; исправлен test normalization и входной Moscow feature для ranking assertion, не runtime. Initial build exit1: Turbopack отверг внешний symlink node_modules. Зависимости скопированы локально без исходных/config изменений, повторён только failed build — PASS. Initial logs и required-checks-initial.json сохранены. Sparse checkout дополнен non-overwriting копией доступных исходников; старая рабочая копия не изменялась.

Evidence: [README](../../experiments/nationwide-tolls/checks/2026-10-17-address-probe-timeout/README.md), [summary/source SHA256](../../experiments/nationwide-tolls/checks/2026-10-17-address-probe-timeout/summary.json), [commands/results](../../experiments/nationwide-tolls/checks/2026-10-17-address-probe-timeout/required-checks.json), gzip stdout. В локальном блоке новых live-аудитов/routing/trace/primary0;8fault tests целиком mocked. Старые аудиты/сохранение ЦКАД не повторялись.

## Сохранение и следующий шаг

Перед non-force записью подтвердить актуальный head925c8c4d…/PR14draft и отсутствие активного CI. Final code commit БЕЗskipci, exact local/remote tree+path SHA+head readback. Новый CI считать отдельно, не объявлять его successful заранее. STARTED/DONE и предыдущая история сохраняются. Main/merge/Production/Android без изменения.

NEXT после code durable readback: фактический code CI, затем ограниченная первичная привязка западныхМ-12 рамок10782165529/11214930528/11157985901 и различных exits22Н-0239/М-7.2952/1239 без доказательства не назначать; не повторять74/76/309 иЦКАД. Полный тариф двух поездок остаётсяunknown.

Уточнение сохранности evidence: initial focused invocation exit1 наблюдался в выводе инструмента (AssertionError по undefined/JSON normalization), однако focused-initial.log при финальной проверке имеет0байт, причина не установлена. Полный initial focused raw НЕ сохранён; empty gzip не является его доказательством. initial-observations.json явно фиксирует доступное наблюдение и это ограничение. Initial build raw и все принятые final logs доступны; окончательные8/744/TS/ESLint/build PASS прочитаны из реальных логов.
