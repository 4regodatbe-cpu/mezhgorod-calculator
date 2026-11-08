# DONE — B05 принятая тарифная основа / реальная поездка

**Дата:** 27.10.2026. **Parent:** c36888e4e1b2b42881c44735cb1136cd450eafd4. **Ветка:** fix/v3-missing-route-prices-2026-10-15, PR14 Draft.

Решение: из приказа №58 (последний сохранённый оригинал для М4) принять цену продуктов 517–544 и 544–589 по решению пользователя `docs/TARIFF_SOURCE_POLICY.md`. Источник: `experiments/nationwide-tolls/source-snapshots/m4-order58-2026-03-02-category1-verified.json` и оригинал `experiments/nationwide-tolls/source-documents/m4-order58-effective-2026-03-02.pdf`. Сохранённые цены 140/160 и180/250 ₽ перепроверены как данные уже прочитанного snapshot, но сам PDF повторно не аудировался.

Реальная поездка: `pair-m4-a289-taman-to-voronezh`, `5818209495`. Геометрия установлена ранее, новых трасс нет. Начисляемый набор тарифных продуктов и повторная оплата не определены; `routeFareRub:null` и статус unknown. Не засчитывать как новое полное платное направление.

Новые файлы: `experiments/tariff-proof-selection/B05_ACCEPTED_PRICE_BASIS.json`, `B05_PRICE_BASIS_REVIEW.md`, обновлены WORK_STATE/WORK_LOG/NEXT_STEPS. **Проверка:** исходные source SHA, номера приказа, четыре денежные ячейки, gate и отсутствие ложного начисления: PASS из данных repo; PDF не загружался, браузер/маршрутизатор/production/test-suite не запускались. После публикации проверять remote branch/tree и изменённые файлы.

**Следующая независимая задача:** B03 реальные браузерные сценарии замены адреса Б.
