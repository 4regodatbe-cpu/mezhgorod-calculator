# BLOCKED_BY_ENVIRONMENT_DNS — GeoNames pilot A, 24.10.2026 МСК

**Источник плана:** [STARTED](2026-10-24-address-geonames-pilot-STARTED.md). Parent `1e38e0b6544f107a8299ce396474fe78dd340f15`, tree `beab6d593d6df96cbd7ab269caee69a87eb51a46`, branch `fix/v3-missing-route-prices-2026-10-15`, PR14 draft. Реализацию/скачивание не запускали.

## Команды и фактический результат

В рабочей среде container выполнены ровно три `curl -I -L --connect-timeout 6 --max-time 10` к официальным URL:

| URL | curl exit | HTTP code | DNS | Размер/ETag/Last-Modified |
| --- | ---: | --- | --- | --- |
| https://download.geonames.org/export/dump/RU.zip | 6 | 000 | Could not resolve host: download.geonames.org | неизвестны |
| https://download.geonames.org/export/dump/UA.zip | 6 | 000 | Could not resolve host: download.geonames.org | неизвестны |
| https://download.geonames.org/export/dump/alternateNamesV2.zip | 6 | 000 | Could not resolve host: download.geonames.org | неизвестны |

Ни тело HTTP, ни заголовки, ни размер файла не получены; `curl` выполнил **0 downloads**. Ошибка на этапе DNS; она ничего не доказывает о работоспособности внешнего сервера. Нет повода повторять те же HEAD в неизменной сетевой среде.

## Итог, принятые решения и продолжение

- Pilot A: **BLOCKED_BY_ENVIRONMENT_DNS**, не PASS и не data validation. Pilot B/C: **NOT_STARTED**. Каталог GeoNames остаётся **CANDIDATE** с неразрешёнными questions coverage/size/Russian aliases/homonyms/location quality/attribution.
- Следующее возвращение к Pilot A: только при наличии сетевого пути, который может корректно получать ответ download.geonames.org. Проверить размеры и HTTP/validators в пределах ≤3 HEAD, затем отдельный B-STARTED до большой загрузки; не расходовать запросы на повтор при том же DNS.
- Независимо допустим **read-only** дизайн отказоустойчивого `settlementFallback`, без загрузки каталога, без production code и без выдумывания городских координат; сохранить отдельно.
- Не затронуты маршруты/OSRM/выбор fastest, цены, платные участки, Phantom/Photon runtime, main/Production/Android/backup; PR14 остаётся draft. Code gates/build/live не запускались (docs-only). Прежние 887 tests не относятся к этому checkpoint.

Изменяемые документы: этот checkpoint, top handoff, NEXT_STEPS, BLOCKERS, append-only WORK_LOG. Durable подтверждается отдельной remote ветка/tree/blob readback.
