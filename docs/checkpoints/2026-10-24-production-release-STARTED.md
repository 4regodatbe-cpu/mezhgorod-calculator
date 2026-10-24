# STARTED — публикация по прямой команде пользователя, 24.10.2026 МСК

Пользователь в текущем сеансе прямо поручил «Публикуй». Это разрешает Production-выпуск текущего проверенного кода; main/merge/Android/backup не затрагивать, PR14 остаётся draft. Резервный поиск не активировать.

Release source: da77f96f4f9185017938ed07022557611f3ea9bf / tree4b190f413be87d0488d7a32c93da8cb5ba9ff3fc, разрешённая fix/v3-missing-route-prices-2026-10-15. Exact Preview dpl_6nuHrXzSce7pUW9EHcVMHaMMhZvH READY соответствует этому source. Проект prj_JbuIKFQNjD3FvAcX2I65Dm5OBKie/mezhgorod-calculator, team_UFuw0UGXjMqBV2hJBxsWGAMS. Предыдущий Production dpl_DGhwwdXRTKwbbEMR127M5AbDMAoP/source4b647bfe01c903352f3842072ceafb23ea6d10a2, READY; сохранить как rollback reference.

Допуск: последние code gates898/898, quote/API, ESLint0errors5warnings, webpack/TS/static16 PASS — checks/2026-10-24-city-snapshot-render. После них только docs. Обычный старый CI address503FAIL не объявлен новым PASS; новых live routes не запускать. Snapshot false, browser UI NOT_RUN/Chromium absent; выключенный модуль не входит в активное поведение релиза. Другие switches не менять. Unknown/partial/fastest и price completeness сохраняются.

План: после durable STARTED создать отдельное Production deployment из exact gitSource SHA (не из moving branch). Дождаться READY/ERROR, сохранить id/log при ошибке; не claim success по create response. Проверить deployment source/target/aliasError и публичные aliases; ограниченный GET главной/V3/V2/version по доступному транспорту. Без нового route/performance/autocomplete корпуса. Защиту/credentials/env не менять. Сохранить DONE/FAILED, фактические HTTP/блокеры и итоговый head/PR.

При прерывании сначала найти exact Production deployment этого source, не создавать дубликат. Ошибка сборки не причина передвигать alias вручную на непройденный build. Разрешение публикации не означает включение snapshot, исправление неизвестных тарифов или подтверждение browser E2E.
