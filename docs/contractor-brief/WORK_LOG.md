# B01–B12 work log

## 26.10.2026 17:01 МСК — B03 hosted Chromium DOM smoke STARTED

Remote SHA `1ac7776dea54139554cfce39b20d11b7a04125a2`, PR #14 Draft. Added isolated Chrome runner targeting only `about:blank`; no application `/r`, external address service, or eight UI scenarios in this block. Snapshot expiry is 31.10.2026 11:24:54 МСК; currently fresh, but must be checked again before any scenario use. [STARTED](../checkpoints/2026-10-26-1701-b03-chrome-smoke-STARTED.md).

## 26.10.2026 16:51 МСК — three nationwide tests environment diagnosis DONE

GitHub Actions run [40332405721](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40332405721) on allowed head `2907a409305834c4cb9b25bc717978f049bb22f9`, Node 24.21.0: child-process tests 3/3, automatic policy replay integration 3/3, systemic report 1/1; total 7/7 PASS, 0 FAIL. Artifact/log streams fetched and archived with zero exit codes/empty stderr; see [evidence](../../experiments/nationwide-tolls/checks/2026-10-26-three-test-diagnostic/README.md). Earlier local `spawnSync ... EPERM` failures are confirmed Codex child-process sandbox restriction, not product failures. Do not rerun absent a new cause. [Checkpoint](../checkpoints/2026-10-26-1651-nationwide-three-tests-CODEX-ENVIRONMENT-DIAGNOSIS-DONE.md).

## 25.10.2026 07:46 МСК — nationwide three-test infrastructure blocker

Уточнение после readback remote SHA `77658f4bffe872e2db29bd796f4993befa4529c6`: connector ref update не породил GitHub Actions run, а доступного workflow-dispatch API нет. Hosted tests NOT_RUN; sandbox-only classification не сделана. Следующий запуск требует обычного authenticated push event по разрешённой ветке. Подробности: [checkpoint](../checkpoints/2026-10-25-nationwide-three-tests-CODEX-ENVIRONMENT-BLOCKED.md).

Три файла имеют общий наблюдаемый локальный блокер: при попытке запуска `node --test <file>` parent Node получил `Error: spawnSync /opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node EPERM`; stdout/stderr дочернего процесса пусты. Assertion-level причины неизвестны. Для отделения sandbox от тестов добавлен узкий Node 24 workflow только в разрешённой ветке; он сохраняет каждый stdout/stderr/exit code артефактом. Результат GitHub Actions пока не подтверждён. [Checkpoint](../checkpoints/2026-10-25-nationwide-three-tests-CODEX-ENVIRONMENT-BLOCKED.md).

## 24.10.2026 21:54 МСК — автономная работа начата

По прямому поручению владельца создана отдельная чистая копия разрешённой ветки на exact remote/PR head `70ab6b840862fa40f090b960ee650b058e83b768`; исходная локальная ветка `work` не изменялась. Обязательные инструкции и полный brief B01–B12 прочитаны. Четыре параллельных исполнителя назначены только на read-only исследование; writer один.

До начала изменений подтверждено отсутствие queued/in-progress/waiting/requested/pending Actions. Широкие тесты и маршруты не запускались. Новая среда содержит Chromium 154, поэтому первым техническим кандидатом после сохранения recovery выбран ограниченный B03 browser block по уже утверждённым восьми mocked `/r` сценариям. Подробности и ограничения: [checkpoint](../checkpoints/2026-10-24-215401-b01-b12-autonomous-recovery-DONE.md).

Следующий шаг: отдельный STARTED для B03, frozen dependency install, фактические PASS/FAIL/SKIPPED/NOT_RUN без включения fallback-флага и без Production.

## 24.10.2026 21:56 МСК — B03 browser preflight BLOCKED

Chromium 154 теперь присутствует, но bounded headless `about:blank` smoke упал до DOM: crashpad `setsockopt: Operation not permitted`, SIGTRAP/exit133. Поэтому dependencies не устанавливались и восемь UI-сценариев не запускались. Статус уточнён с «binary отсутствует» на `BLOCKED_BY_ENVIRONMENT_BROWSER_RUNTIME`; это не дефект приложения и не PASS. Evidence: [README](../../experiments/road-ref-boundaries/checks/2026-10-24-b03-browser-preflight/README.md) · [checkpoint](../checkpoints/2026-10-24-215649-b03-browser-runtime-BLOCKED.md).

Следующий независимый шаг: B04 exact-coordinate/topology intake; официальный км/scope/цена остаются unknown.

## 24.10.2026 21:59 МСК — B04 exact OSM intake STARTED

После durable B03 blocker начат отдельный bounded source intake ровно двух nodes и четырёх ways уже доказанной pending-пары М-4. Лимиты, fail-closed поля и recovery: [STARTED](../checkpoints/2026-10-24-215900-b04-osm-coordinate-intake-STARTED.md). Route replay, тарифные изменения и широкий аудит запрещены.

## 24.10.2026 22:01 МСК — B04 OSM identity/topology DONE; km/scope/fare BLOCKED

Шесть exact OSM API объектов получены HTTP200 и сохранены с metadata/SHA/ODbL. Entry `4443232947` подтверждён как directed `447135768 → 1182567076`, exit `358467208` как `1211606940 → 28835034`; координаты сохранены. Offline verifier PASS15/15, live0. Reviewed manifest остаётся `runtimeEligible:false`, `officialKilometre:null`, `operatorScope:null`, `fare:null`. Runtime/data/tariffs не менялись, route replay/full audit/build NOT_RUN. [DONE](../checkpoints/2026-10-24-220143-b04-osm-coordinate-intake-DONE.md).

Следующий независимый блок: B10 точечное восстановление незавершённого V2 compare Ейск/Майкоп; B05–B09 ждут новых первичных документов.

## 24.10.2026 22:05 МСК — B10 V2 compare recovery STARTED

Сверён старый незавершённый STARTED: V2 evidence/DONE отсутствуют, V3 captures/replay уже сохранены и повторяться не будут. Текущий блок ограничен frozen install и подготовкой двухслучайного V2 harness с no-network preflight; live capture начнётся только после следующего durable STARTED. [План и recovery](../checkpoints/2026-10-24-220525-b10-v2-compare-recovery-STARTED.md).
