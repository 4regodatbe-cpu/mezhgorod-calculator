# Автоматическая очередь: включение workflow

16.10.2026. Parentf45cc0c1; ветка fix/v3-missing-route-prices-2026-10-15, PR14draft. Локально focused14/14PASS, fullbuild666/666+quote/API/Next/TypeScript/static16/16PASS; ESLint4mjs exit0; YAMLparse/branch/permission/concurrency/timeguardPASS; diffcheckPASS. Логи evidence/2026-10-16-auto-queue-{focused,build,lint,yaml}.log.

Добавлен .github/workflows/nationwide-audit-queue.yml. Push этого файла в разрешённую ветку запускает job. Перед case он выполняет полный gate. Исполнитель automatic-audit-queue.mjs сохраняет STARTED и DONE/FAILED по1case, raw/progress/replays/actualmoney/report/inventory, gitpush безforce и headreadback. Верхняя граница320мин, три ошибкиподряд останавливают; возобновление с первого неподтверждённогоcase. Дублировать ручной runner при active workflow запрещено. concurrency не отменяетактивнуюработу. Разрешения contents:write используютсядляэтойветки, провайдерам токен неотправляется. Не main/merge/Production/Android.

Проверка внешнегоGitHub read-only API /actions/runs успешна до включения. Фактзапуска новогоjob требует чтения /actions/workflows/nationwide-audit-queue.yml/runs послеpush; на моментподготовки этотновыйrun ещёне наблюдался. Не считатьодин YAML успешнымвыполнением. Пока baseline27/155,0/154; следующийcase kherson-геническ-kazan-center.

После AUDIT_QUEUE_DONE продолжить часть19:разбориустранение находок пооднойпричине, затем часть20полныйgate/передача. Самjob не исправляет неизвестныетарифы и не объявляетвсе20частейготовыми. Задачаавтопродолжениядолжна читать WORK_STATE/AUTO_QUEUE_STATE и не писатьпри activejob. ЕслиGitHubwriteнеудачен,artifactсохраняетevidence, но не являетсяdurableGitHubbranch checkpoint.
