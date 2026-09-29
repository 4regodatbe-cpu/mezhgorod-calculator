# M4 Step 2 — Hard regression assertions

Дата: 2026-09-29

## Статус

ЗАВЕРШЕНО.

## Что сделано

В workflow `.github/workflows/toll-diagnostics.yml` добавлен отдельный шаг `Assert M4 regression invariants`.

Коммит с assertions:

`495cee49add708075754ecee88aaf20b45a0531a`

## Что теперь проверяется жёстко

Для каждого из 10 контрольных направлений workflow требует одновременно:

- `validation.complete == true`;
- `checkedCandidateCount == candidateCount`;
- `unknownCount == 0`;
- `pricing.status == priced`;
- `pricing.unresolved` пуст;
- точное совпадение `weekdayAmount`;
- точное совпадение `weekendAmount`;
- текущий `amount` должен совпадать либо с weekday, либо с weekend тарифом;
- `confidence` не ниже `medium` (`medium` или `high`).

## Контрольные суммы

### Юг → Москва

- Ейск → Москва: 5240 / 7240 ₽
- Майкоп → Москва: 6090 / 8400 ₽
- Ялта → Москва: 5240 / 7240 ₽
- Краснодар → Москва: 6090 / 8400 ₽
- Сочи → Москва: 6090 / 8400 ₽

### Москва → Юг

- Москва → Ейск: 5240 / 7240 ₽
- Москва → Майкоп: 6090 / 8400 ₽
- Москва → Ялта: 5240 / 7240 ₽
- Москва → Краснодар: 6090 / 8400 ₽
- Москва → Сочи: 6090 / 8400 ₽

## Результат проверки

GitHub Actions run:

`36607780640`

Job `diagnose`: `success`.

Все шаги завершены успешно:

- Wait for production deployment — success
- Query problem routes — success
- Assert M4 regression invariants — success
- Upload diagnostic JSON — success

Это означает, что все 10 маршрутов прошли новые жёсткие assertions после добавления `route_traversal` для ПВП 803/911.

## Следующий шаг

Действие 3 из 5: подключить новый M-4 local validator + route-context pricing к обычному `/api/v2/calculate` как основной механизм расчёта М-4, сохранив текущий recovery/fallback на случай incomplete/timeout/error.

До начала действия 3 основной V2 не изменять.
