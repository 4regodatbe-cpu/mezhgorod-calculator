# Расширенная проверка: 58/59, одно старое ожидание суммы

FAILED 2026-10-15T21:55:41.838424+03:00, parent remote8c90e941bd372ece2eaa11e03a3f25ea5a4fa317, PR14draft. Добавлен overflowguard длительности вdepartureTariffContext. Обновлены3старыегруппыожиданий; добавлены2regression: explicitdeparturevsМ11payment(день/ночь/датаисточника) иЗСДdepartureдоначала тарифа сarrivalпосленачала. Расширенныйfocused8файлов exit1,58/59PASS; точнаякоманда/вывод в docs/checkpoints/evidence/2026-10-15-departure-policy-focused-expanded.log.

ОставшийсяFAIL scripts/v3-time-calendar-audit.test.ts:32: составнойМ4+А289маршрут имеет обеизвестныецены и стал1265=850+415 послеустраненияtimeblock; старыйassertnullошибоченподновойполитикой. NEXT: ожидаемая1265,добавитьотдельныйassertпринудительнонеизвестногоМ4длясохраненияполнотыкомпозиции, затемповторfocused/fullgate. ПолныйbuildещёнеPASS.

Отдельно: gitdiff--check предыдущего checkpoint отмечал trailingwhitespace в неизменённом stdout assertion errors. Rawstdout сохранён дословно; source/документы проверять сисключением evidence/*.log. Runtimeтарифныечисла/геометриянерасширялись, Production/Android/mergeнет.
