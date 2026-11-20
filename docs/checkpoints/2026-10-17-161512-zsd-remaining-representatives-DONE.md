# ЗСД: оставшиеся представители, DONE

2026-10-17T16:15:12.524763+03:00. Статус анализа: DONE. Итог тарифных областей: **заблокирована отсутствием надёжных данных**. Новая причина повторного заезда: **отложена до отдельного кодового блока**, точные6proof сохранены.

## Входы и состояние

Ветка `fix/v3-missing-route-prices-2026-10-15`, source/branch/PR head `97d165fe4d071e68d2a30b341babc16fb1c2af56`; PR14 открыт/draft. Actions39033008320 фактически completed/success при начале работы; последние3runs completed/success. Чистый checkout текущей сессии совпадал с remote. CLIpush/credentials не трогали. Main/merge/Production/Android/сообщений/автоматизаций нет.

Канонический handoff указывал обратную группу1e954c437e46. Проверен представитель Сестрорецк→Казань: физически КАД-север→КАД-юг, южное направление, два направленных ПВП1766158804 и933975069. Надёжного готового cash/card вектора не найдено. По тому же source-gap далее изучены только ещё не разобранные представители, без повторения9/7представителей прошлого блока и без rerun74/76/309.

## Что выполнено и зачем

9 новых представителей соответствуют34 случаям в physical fingerprints; это не34проверки. Для каждого проверены captureSHA, sealed resultSHA, complete trace/booths, selected provider, метры и точное совпадение всей geometry с record.route.coordinates. Для OSRM берутся собственные steps/GeoJSON; для Valhalla — собственные decoded polyline6/maneuvers. После обнаружения конкретного повторного заезда добавлены5siblings той же группы; всего14уникальных фактически изученных случаев. Скрипт `experiments/nationwide-tolls/scripts/review-zsd-remaining-scopes.py`. Отдельные cases/*.json, progress/summary/STARTED сохранены как короткая offline-единица; долгих новых сетевых тестов не было.

Полная таблица, первичные ссылки/SHA и ограничения: `experiments/nationwide-tolls/checks/2026-10-17-zsd-remaining-scopes/README.md`, `experiments/nationwide-tolls/checks/2026-10-17-zsd-remaining-scopes/source-review.json`, `experiments/nationwide-tolls/checks/2026-10-17-zsd-remaining-scopes/summary.json`.

Во всех6случаях5733 подтверждён selected trace motif: северное ЗСД ответвление→ПВП1766158781→городские links151490266/355755820/192140964/784207300/784207299/355755821 с toll=false→312063993/192140957/355755818/191727240/355755819/721839718/252148969→ЗСД233006897 наюг. Вход и выход разных оплачиваемых частей разделены городским разворотом. Готовый единый обратный вектор применять нельзя. Фактическая ошибка выбора физической геометрии по правилу no-reentry доказана; числовая ошибка тарифа не заявляется, поскольку компонент ужеunknown. Исправление ещё не реализовано; отдельный следующий кодовый блок, не новая серия source-gap поиска.

Группа2c00 (7случаев) входит со стороны Крузенштерна/Шкиперского, а не Екатерингофки: найден raw end_node13020687195 type=toll_gantry на351741889, toll=false. Это не доказательство бесплатности. Точный отдельный продукт/тариф развязки source-gated;6siblings этой группы не проверены. Не переносить600-вектор Екатерингофки на этот въезд.

Общие ставки/направленные определения владельца сохранены и сверены по8SHA. Свежие bounded обращения: оператор403, владелец502. Поиск выдал старые operator rules/нерелевантные результаты, но не current directed collection bundle; вторичные цены не использованы. Поиск остановлен. Для восьми представителей нужны точные primary привязки оплаты к entry/exit; тарифы не назначены по количествуПВП или совпадениюназваний.

## Проверки, ошибки и ограничения

Первый запуск остановился после1case на OSRMGeoJSON KeyError0: скрипт ожидал encoded string. Добавлено чтение geometry.coordinates для dict; rerunexit0,14unique/6reentry. Ошибка и восстановление сохранены. Эксперимент прямой привязки trace end_shape_index к input.shape отброшен: matched trace индексы отличаются от входной формы; пробные координаты не попали в решения/тарифы. Не считать это доказательством runtimeошибки координат.

Выполнено:14captureSHA и14sealedSHA,14selectedgeometry identity. Воспроизводимость, syntax, JSON, ссылки, resultSHA иgitdiff фиксируются в validation.json. Full unitgate/TS/Nextbuild заново не запускались; runtime/тарифы/старыеcases не менялись. ИсходныйCI39033008320 success; post-saveCI проверять отдельно, не приписывать ему успех.

Счётчики:9представителей+5исключений=14новых уникальных boundaryreviews. Накопленно24из50unknowncases получили разборграниц,11из11physicalgroups представлены;26siblings непроверены. Новыхcomponent/date проверок0;28старыхprofile records использованы безпересчёта. Новыхfullreplay/live0. Новыхрассчитанныхкомпонентов0; подтверждённыхполныхтарифов0. Baseline26priced/50unknown неизменён.

## Сохранение и NEXT

Обновлены короткий WORK_STATE, NEXT_STEPS, append-only WORK_LOG, PART19_FINDINGS_QUEUE.postAuditSolution.directedGroupReviews и новая postAuditGeometryFindings. История сохранена. Перед переносом проверитьhead/PR/activewriter; один non-force connector commit с expectedparent97d165fe…, exact local/remote tree, всеchangedblobSHA иbranch/PRreadback. ФактическийSHA итоговогокоммита определяетсяпослезаписи, безсамоссылки. ПриактивномCI веткунеобновлять.

Следующийкодовыйблок: устранение подтверждённого выхода/повторногозаезда5733 в выбранном маршруте. Сначала trace transport/route selection/validation контракты и мотив из6capture; затем один узко ограниченный guard и focused отрицательные/положительные тесты, обязательныйgate/build; не подменять один fastest маршрут более медленным бесплатным. Пока sourceцены unknown, их не подставлять. Остальные26siblings не запускать безготового общего решения/новойпричины.

Фактическая финальная проверка: повтор в отдельном output-dir exit0;14caseJSON идентичны, summary идентичен безtimestamp. Python syntax, JSON, hashes14+14, первичные8SHA, handoff links, очередь11groups/24checked/26unchecked иgitdiff PASS. Это повтор техже14случаев, не новыеуникальныепроверки. validation.json сохранён.
