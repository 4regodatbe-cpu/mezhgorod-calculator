# Offline GeoNames country review — 24.10.2026

Не импортируется приложением. Все координаты только evidence, runtimeEligible=false.

Вход: artifact12558568536 из run40091634576; outer ZIP SHA2560c92e4e0e21c5e39355344264cadcbba6640d06db64fff6c055adc1944814ce8. Country SHA/bytes/URLs в ../2026-10-24-geonames-country-download/manifest.json. Raw archives временные (artifact до07.11.2026); 93 выбранные исходные записи с19полями и line/hash сохранены здесь постоянно.

Воспроизведение: из корня checkout выполнить `python experiments/road-ref-boundaries/checks/2026-10-24-geonames-review/review.py --selftest`, затем `timeout 120 python experiments/road-ref-boundaries/checks/2026-10-24-geonames-review/review.py /absolute/path/geonames-country-pilot.zip experiments/road-ref-boundaries/checks/2026-10-24-geonames-review`. Нужен Node24 с native TS stripping. Сеть/сторонние библиотеки не нужны. Анализатор использует production classifyTerritory в read-only режиме на source coordinates, не на benchmark.

RU413135/UA45744 исходных строк, всего458879. P-класс203263+33743=237006. invalid format/coords0; duplicate geonameid0. P включает10770 RU abandoned PPLQ,302historical PPLH и другие специальные коды: это НЕ237006 готовых современных поселений. Фильтр актуальности нужен отдельно.

| Полигон | RU records | UA records | Полнота |
| --- | ---: | ---: | --- |
| ДНР | 0 | 1803 | UNKNOWN |
| ЛНР | 1 | 1375 | UNKNOWN |
| Запорожская | 0 | 1266 | UNKNOWN |
| Херсонская | 0 | 985 | UNKNOWN |

Counts означают попадание координат в проверенные4полигона версииv05, не количество реальных современных населённых пунктов. Пограничных/overlap exceptions0; вне4полигонов231576. Крымский полигон не входит в dataset, coverageUNKNOWN; административные коды/наличие Ялты и Севастополя не заменяют проверку полигона. RU-source point внутриЛНР демонстрирует, почему фильтр по стране не заменяет геометрию.

| Запрос | distinct ids | Вывод |
| --- | ---: | --- |
| Москва | 3 | AMBIGUOUS |
| Краснодар | 2 | AMBIGUOUS |
| Донецк | 2 | AMBIGUOUS (РФ/ДНР) |
| Луганск | 2 | AMBIGUOUS |
| Ялта | 5 | AMBIGUOUS, включая2ДНР |
| Севастополь | 3 | AMBIGUOUS |
| Тарасовка | 75 | AMBIGUOUS, включая2ДНР |
| Черноморское | 1 | SINGLE CANDIDATE, точность UNVERIFIED |

Все93матча получены через untyped country aliases; primary names почти все Latin (кириллицу содержат42RU+3UA P-названия; кириллица не доказательство русского языка). Русская языковая маркировка/историчность V2 не проверены. Admin1/admin2 — коды, не готовые русские подписи; без mapping/проверенных labels UI неоднозначность не решена. Одно совпадение не доказывает точность или отсутствие других населённых пунктов вне RU/UA.

Проверки: selftest parser/finite/range/field_count/homonyms PASS; bounded dataset review5.789с; sum/count conservation237006 PASS;93исходные raw-row hashes PASS; git diff --check. Изменений calculator runtime0, новых запросов0, прежние code gates не повторялись. Counts/позиции/aliases не являются разрешением активации.

Следующий малый блок: review shape/feature-code/label gaps на93сохранённых кандидатах, затем bounded independent source для выбранных priority IDs/русских labels. Не скачивать снова RU/UA или весь V2; не реализовывать активныйfallback до reviewed snapshot/attribution. Недостающие тарифы/километры не менялись.
