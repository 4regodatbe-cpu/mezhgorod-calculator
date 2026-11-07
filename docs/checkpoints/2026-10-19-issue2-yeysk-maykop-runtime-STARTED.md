# STARTED — восстановление runtime для двух непроверенных OD issue #2

Дата: 19.10.2026. Разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`; исходный и подтверждённый HEAD `4954467988cf58a92acec725816e5f7688c70a82`, tree `f1ebb3285102b66cb8ec055c87a9299522e407fb`. PR #14 open/draft. Actions run `39239030289` на этом HEAD завершён: `verify=success`, `live_probe=success`.

## Входы и цель

Предыдущий BLOCKED checkpoint установил, что текущий sparse checkout содержит `docs/` и `experiments/nationwide-tolls/`, но не содержит root `scripts/`, `lib/`, `app/`, `components/`, `public/`; `node_modules/` отсутствует. В именах файлов и несжатых JSON для Ейск—Москва / Майкоп—Москва exact route records не найдены. Точные адреса старого issue также пока не установлены.

Цель этого небольшого блока — восстановить только исполняемые части проекта и зависимости, чтобы определить доступный capture runner и его обязательные inputs. Добавить в sparse checkout root `scripts/`, `lib/`, `app/`, `components/`, `public/`, `data/`; выполнить `pnpm install --frozen-lockfile` (проект закреплён на `pnpm@11.25.0`, локально `node v24.19.0`, `pnpm 11.25.0`).

## Границы и критерии готовности

Этот блок не запускает route/provider requests, capture или replay. Сначала после восстановления проверить, что найденный runner применим к двум cases и что точные endpoint controls доступны; без них не выдавать proxy за повтор старого issue. Готовность: требуемые директории доступны, зависимости установлены, ветка и tracked tree чистые, найден/не найден подходящий runner записан с точным путём. Затем отдельный STARTED checkpoint перед bounded route cases.

## Сохранение и восстановление

До выполнения операции STARTED запись сохраняется отдельным commit в разрешённой ветке с точным GitHub readback. Если sparse expansion или install прервётся, проверить реальный процесс, локальную ветку/tree и сохранённый HEAD; продолжить только незавершённую часть. Не менять матрицу/тарифы, не повторять completed source lookups, не трогать main/Production/Android.
