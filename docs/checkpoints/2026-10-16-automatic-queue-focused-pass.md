# Автономная очередь: focused PASS, build STARTED

16.10.2026, parenta17cf7ae, рабочая ветка/PR14draft. Added automatic-audit-queue.mjs: фиксированная ветка, одинcase, durable STARTED/DONE, sha/parity/raw verification, remotehead до/послеpush, безforce, стоппри3ошибках/320мин/конфликте. Runner сохраняет фактический unknown, не повышаетготовностьтарифов. Часть19 остаётсяreview/fixes,20финальнаяпроверка.

recordingFetch получил hook onProgress; live runner атомарно сохраняет ответы каждого завершённого запроса в progress-*.json.gz, включая ошибки. complete=false исключает принятие промежуточногофайла за completecapture, inventory '*capture.json.gz' его не считает. Незавершённые запросы ответа ещё неимеют. Провайдерныепараметры/тарифы не менялись.

node --test automatic-audit-queue.test.mjs audit-child-process.test.mjs systemic-audit-io.test.mjs:14/14PASS. Лог evidence/2026-10-16-auto-queue-focused.log. Покрыто: порядокочереди, missingraw/replay, crossedcase, невернаяSHA, moneyparity, unknownexecutionvalid, callbacksнауспехи/ошибки,childtimeout/stream.

Workflow пока не добавлен в репозиторий: включать только после локальной проверки. STARTED pnpm build → evidence/2026-10-16-auto-queue-build.log. Затем ESLint изменённыхJS и проверкаYAML; после PASS сохранить workflow и удостовериться, что GitHubActions действительно запущен. Не объявлятьзапуск по одномуфактуupload YAML. Recovery по WORK_STATE и gitstatus; не запускать параллельную ручную очередь.
