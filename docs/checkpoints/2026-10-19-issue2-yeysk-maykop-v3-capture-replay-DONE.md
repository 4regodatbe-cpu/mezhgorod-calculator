# DONE — V3 proxy captures и weekday/weekend offline replay issue #2

Дата: 19.10.2026. Ветка `fix/v3-missing-route-prices-2026-10-15`. Блок начат после durable STARTED checkpoint; captures и replay выполнены локально. PR14 остаётся draft.

## V3 captures

Ровно по одному завершённому V3 `POST /api/v3/calculate` на каждую project regression proxy-пару с departure `2026-10-22T09:00:00+03:00`. Сохранены request, полный API response и каждый фактически выполненный raw fetch request/response.

| Направление | Дистанция | Время | API amount Thu | weekday/weekend | Route validation | Fetch calls |
|---|---:|---:|---:|---:|---|---:|
| Ейск → Москва | 1 271 781 м | 59 629 с | 4 340 ₽ | 4 340 / 5 240 ₽ | complete, M-4, 1 toll edge | 14 |
| Майкоп → Москва | 1 404 674 м | 65 838 с | 5 040 ₽ | 5 040 / 6 090 ₽ | complete, M-4, 1 toll edge | 15 |

В обоих случаях API status 200, выбран Valhalla, все записанные fetch responses — HTTP200, ошибок нет. `quality.providers=["Valhalla"]`.

Capture artifacts:
- `source-snapshots/issue2-yeysk-maykop/2026-10-19/yeisk-to-moscow.json.gz`: 426679 bytes, SHA-256 `425d4622d3851d9f33c94caf8731ce3df439bf8e95eb34c8d70dbfe3889ea27f`.
- `source-snapshots/issue2-yeysk-maykop/2026-10-19/maykop-to-moscow.json.gz`: 434453 bytes, SHA-256 `97465139af01510b4439ac494d56fb008b78177ce15efd05edb8996b66934366`.

## Offline replay

Все четыре V3 replay вернули HTTP200. Для каждого ответа были использованы все сохранённые fetch responses ровно по одному разу: Ейск 14/14, Майкоп 15/15; replay misses=0, unused responses=0, live network fetches=0. Метры/секунды/provider совпали во всех replay. Thursday replay сохранил capture amount; Saturday amounts изменились согласно календарю:

| Направление | Thursday 22 Oct | Saturday 24 Oct | Та же геометрия |
|---|---:|---:|---|
| Ейск → Москва | 4 340 ₽ | 5 240 ₽ | 1 271 781 м / 59 629 с |
| Майкоп → Москва | 5 040 ₽ | 6 090 ₽ | 1 404 674 м / 65 838 с |

Replay artifact `source-snapshots/issue2-yeysk-maykop/2026-10-19/offline-replay.json.gz`: 2098 bytes, SHA-256 `580f2c6d6c77462b79049c14e2d10162a265b7c0f96c4f22018bec067887edf3`.

## Ограничения и следующий шаг

Координаты из `scripts/segment1-user-regression.mjs` не доказаны как исторические UI-controls. Кроме того, этот regression script обращается к `/api/v2/calculate`, а captures выше проверяли `/api/v3/calculate`; его ожидания 5 240/7 240 ₽ и 6 090/8 400 ₽ относятся к другой версии API и не являются прямой сверкой или подтверждённым тарифным источником. Поэтому V3 суммы фиксируются как поведение V3 proxy-control, а расхождение между версиями требует отдельного точечного сравнения.

Первая V3 попытка была прервана shell timeout на 8-й секунде после нескольких внутренних HTTP200, до полного API response; процесс отсутствовал, partial capture не сохранён. Затем один bounded complete capture на OD сохранён выше. Код, матрица и тарифные данные не менялись.

NEXT — отдельный STARTED checkpoint для ровно двух V2 `/api/v2/calculate` captures на те же proxy coordinates и тот же четверг, с полным raw evidence; затем offline replay тех же calls для Thursday/Saturday. Не запускать широкий `segment1-user-regression.mjs`.
