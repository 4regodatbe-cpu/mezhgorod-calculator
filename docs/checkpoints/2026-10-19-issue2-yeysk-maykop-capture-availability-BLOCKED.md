# BLOCKED — Ейск—Москва и Майкоп—Москва: нет готовых capture; runtime аудита не восстановлен

Дата: 19.10.2026. Разрешённая ветка: `fix/v3-missing-route-prices-2026-10-15`. Исходный удалённый HEAD: `9376d179d8ad4573ff880aff08c717d8526ec858`, tree `902df6b04adb900dfaee610b7ece9206ffbbc231`. PR #14 открыт и остаётся draft. Для HEAD run `39235786553`: `verify` — success; `live_probe` — in progress при проверке. Никакой новый commit не отправлялся в ходе активного CI.

## Проверка наличия уже сохранённых результатов

Проверен список файлов `experiments/nationwide-tolls` на названия `yeisk/yeysk/maykop/maikop/eysk`; совпадений нет. Поиск строк `Ейск/Yeysk/Yeisk/Майкоп/Maykop/Maikop` в JSON под `source-snapshots/systemic-road-audit-2026-10-15` и `checks` также не нашёл записей. Поля с точными endpoint controls из старого issue #2 в этих сохранённых индексах не обнаружены. Содержимое сжатых `.json.gz` заново не разбиралось; вывод ограничен инвентарём имён и несжатых JSON в указанных каталогах.

## Причина блокировки

В рабочем checkout включён sparse-checkout только для `docs/` и `experiments/nationwide-tolls/`; исходники и каталог `scripts/` отсутствуют. `node_modules` отсутствует. Поэтому предусмотренный NEXT bounded route capture + same-date/weekend replay здесь сейчас не исполним. Не стали запускать новые route/provider запросы без runner и проверенных endpoint controls. Никакой вывод Москва—Казань на эти OD не перенесён: Ейск—Москва и Майкоп—Москва остаются непроверенными.

Код, матрица и цены не менялись; новых capture/replay/API/source requests — 0. Build/tests не запускались. Локальный HEAD до фиксации: `c8790d2c1bbba7ccc33eaeb8d9ac2a7094a239d9`, tree `902df6b04adb900dfaee610b7ece9206ffbbc231` (содержимое совпадает с удалённым tree, commit ещё не имеет exact remote readback на момент создания этого файла).

## Следующий безопасный шаг

После завершения `live_probe` восстановить полный рабочий checkout и зависимости из разрешённой ветки, определить доступный audit runner и проверить, есть ли в issue #2 точные адреса/координаты для этих двух маршрутов. Только затем создать отдельный STARTED checkpoint на два bounded cases; если точных controls нет, явно маркировать городские точки как proxy и не объявлять результат точной регрессией старого issue. PR #14 остаётся draft; merge, main, Production и Android не затрагивались.
