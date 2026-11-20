# Этап18 — офлайн-разбор сохранённых маршрутных находок

2026-10-15, PR14 draft, ветка fix/v3-missing-route-prices-2026-10-15. Source2520abbd96683b1d53b10787d4d5a2c20c0ba8e5 remote/local подтверждён. Тарифы/app/lib/Production не менялись.

## Фактическое исполнение

Live Лисичанск→СПб остановлен автоматическим approval review: передача private repository coordinates внешнему Valhalla не имеет explicit destination consent. Новый case не засчитан. Независимый offline разбор завершён: `node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/scripts/diagnose-systemic-findings.mjs` exit0, stdout `docs/checkpoints/evidence/2026-10-15-offline-findings.log`. Скрипт запрещает global fetch (`DIAGNOSTIC_NETWORK_FORBIDDEN`), новых внешних вызовов не было. Source — REPORT26имеющихся полных комплектов и ранее сохранённая длинная chain.

## Находки

| Компонент | Что наблюдается | Объём и ограничения | Следующий контроль |
|---|---|---|---|
| М4, время | Whole-trip window отвергается при переходе четверг→пятница. В4случаях все оценочные проходы распознанных ПВП относятся к одному профилю | 15runtimefindings;4кандидата на избыточный отказ. Passage time пропорционально расстоянию, не реальные timestamps; нельзя по ним назначать цену | Проверить границы именно М4 и доказательство времени события, затем тесты смены периода |
| А289 | На10маршрутах все3рамки103/82/23 присутствуют, easternМ4proofесть, originClass/destinationClass=null | Выбранные трассы проходят corridor, но short-route classifier привязан к дальним trip endpoints. Это механизм unknown, не доказательство конкретной цены | Сопоставить фактические границы платного продукта на selected geometry, затем применимость существующей тарифной ячейки |
| ЦКАД | Контрольная длинная цепочка measured242.406925км, guard135–230; отказ ckad_arc_length_out_of_range | Один control route, не все ЦКАД. Причина guard rejection установлена; detour или ошибка scope ещё не установлены | Сверить физические точки/обход и short control; не расширять guard вслепую |
| ЗСД/точные ячейки М4 | REPORT показывает2zsd:unpriced и2m4:unpriced | Это имеющийся набор, не общероссийское покрытие | Exact boundary/node identity и наличие fare row по тому же vector/date |

17диагностических записей охватывают пересекающиеся группы, числа не складывать. Неопознанных payment nodes в этом сохранённом наборе0; это не доказательство полноты всех дорог.

## Temporal evidence

`source-snapshots/systemic-road-audit-2026-10-15/FINDING_DRILLDOWN.json` содержит route/capture SHA, ПВП и расстояния; `TEMPORAL_DIAGNOSIS.json` сохраняет profile каждого approximatePassageAt через действующую m4TariffPeriodAt, без сетевых запросов.4кандидата: Гранитное→СПб, Брянка→СПб, Широкино→Москва, Широкино→СПб.

Проверки: диагностический run exit0, чтение JSON и анализ количества/frames/window, git diff --checkPASS. После data/docs-only шага build не повторялся; предыдущий sourcebuild656/656+quote/API/Next/types/static16PASS. Ни один новый тариф/исправление runtime не внедрён.

## Продолжение

Получить explicit разрешение на передачу городских/контрольных координат и параметров маршрута Valhalla, OSRM и BRouter для текущей live audit кампании; запрос не включает передачу всего репозитория/секретов. До разрешения не повторять сетевой запуск и не обходить approval. После разрешения одинlivecase→raw+same-date+weekend→checkpoint→remote read-back. Затем остальные cases. Обсудить findings до тарифных исправлений согласно ранее принятому решению.
