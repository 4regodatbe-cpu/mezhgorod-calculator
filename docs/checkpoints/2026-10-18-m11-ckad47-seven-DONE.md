# DONE — семь оставшихся случаев въезда ЦКАД47→М11

МСК: 2026-10-18T12:35:35.102446+03:00. Source code `29129946ed7445677332749857f89efbc9ff546b`; CI #39115104478 completed/success, verify/live_probe оба success. STARTED `7ca43b55783109fb53b9df31070759c83080cbd4`, treea57bca01f5d015003bc0a2336f7ade822a028965, 6paths/head/tree/draft readback PASS. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR #14 draft.

## Выполнено

Проверены **7 собственных сохранённых маршрутов / 14 профилей отправления** (15 и17 октября09:00МСК). Каждый исходныйGitblob совпал с inputs; сохранены rawSHA256, provider, физическийgate, статус полныхtrace, направленные boundary, готовая headпара и исход без selectedgatevalidation. Первый представительАрзамас→Приморский не повторялся.

Во всех7случаях новая привязка даёт `tskad→solnechnogorsk`:280₽на15Oct и320₽на17Oct. M11head+mainline4180/4520 — только компонентыМ11, не итог поездки. Материальных исключений0; отрицательные проверки reverse/incomplete/absentgate **21/21 PASS**. Безselectedgatevalidation headnull во всех14профилях.

Вместе с ранее сохранённым представителем эта конкретная причина закрыта **8/8 собственных случаев**; 16стандартных datedheadprofiles, новыхвтекущемпакете14. Новыхвосстановленныхheadcomponents7, суммарно8поэтимвосьми. Новыхнезависимоподтверждённыхполныхтарифов0. Остальные платные системы/готовностьРоссии этими числами не измеряются.

## Что не повторялось

Routing/trace/sourceGET/fullpricingreplay/network — 0. Проверялся только сохранённый selected capture и новый общий guard сдатированнымM11component. Всеcaseoutputs/progress сохранены атомарно, каждый результат имеет input/runner/runtime fingerprint. Runtime и матрица в этом пакете не менялись. Fullgate/build не повторялись: неизменный code уже имеет 757/757+quote/API/TS/ESLint/Next16/16 локально и успешный GitHubCI.

## Очередь и продолжение

По тем же13исходным findingrecords теперь: **2 fixed,1 not reproduced,7 blocked,3 deferred**. Предыдущая сводка1/1/8/3 и старые headsource-gated результаты сохранены в истории; когорты маршрутов не складываются. Это изменение одной причины, не новая нумерация этапов.

Следующий точный случай: **Торжок→Раменское**, `pair-m11-ckad-torzhok-to-ramenskoe`, из оставшейся М11 58–679 причины. Сначала точные сохранённые въезд/съезд и уже имеющаяся primaryгеометрия Торжка. Не переносить подтверждённыйвыезд p679→p258 на иной въезд/направление без proof; не повторять41/15/готовые8. До длительного source/testзапуска новый boundedSTARTED.

Проверки текущего пакета:7rawGitblob/sha,6runtime/datafingerprints,14ownprofiles,21negativeguards,7caseoutputSHA,JSON/progress/queuecanonicalcounts,runner syntax иdiff PASS. Имена caseoutputs иSHA вsummary.json; ошибки/исключения0. STARTED до выполнения уже durable. Последующий DONEcommit/tree/path/headreadback выполняется до следующего независимого шага. Merge/main/Production/Android/автоматизации не выполнялись.
