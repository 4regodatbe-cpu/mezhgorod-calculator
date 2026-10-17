# Ограничение времени address-search live probe — DONE

Source e3c07ac3…, durable STARTED925c8c4d…; PR14draft. Одна причина: fetch/response.json не имели собственного deadline. Исправлена только диагностическая адресная проверка; production address search и route/toll algorithms не меняются.

- request+body ≤10с; общий budget90с (плюс локальная запись отчёта/планирование event loop); AbortController и Promise.race защищают также от источника, игнорирующего abort. Ошибки HTTP/JSON/timeout сохраняются по источнику.
- Исходный array-report совместим; после каждого города atomic temp+rename для массива и отдельного progress artifact. Прогресс содержит completed/planned/remainingQueries/failedSources/status. При budget exhausted основной CLI exit1; даже на последнем городе это не DONE. Ошибки отдельных источников не превращаются в успешный source result.
- Workflow добавляет progress JSON к существующим always-upload artifacts. Другие steps, required checks, общий job timeout не отключались.

8 focused PASS: hanging headers, body, ignored abort, expired/invalid limits, HTTP/JSON failure cleanup, successful result/ranking and incremental saves, concurrent stalled sources/global budget, last-city budget, partial source/following-city recovery. Полный audit744/744+quote/API,TS,ESLint,build16/16 PASS. Локальных live probes/новых routing/trace/primary captures0; fault tests используют injected fetch. Это не подтверждение внешней доступности Photon.

Initial focused ожидание сериализации undefined ошибочно; исправлен тест/fixture, ranking/runtime не менялись. Initial build exit1 из-за external node_modules symlink; локальная копия зависимостей, retry build exit0. Все логи/initial required checks сохранены; summary.json содержит exact source SHA256, required-checks.json — команды/exit/time. Docs-only STARTED имел [skip ci], финальный кодовый commit безskip.

NEXT: фактический code CI, затем отдельная М-12 привязка по saved nodes/двум exits. Матрица/тарифы/app/lib без изменения; full tariffs unknown остаются unknown.

Уточнение сохранности evidence: initial focused invocation exit1 наблюдался в выводе инструмента (AssertionError по undefined/JSON normalization), однако focused-initial.log при финальной проверке имеет0байт, причина не установлена. Полный initial focused raw НЕ сохранён; empty gzip не является его доказательством. initial-observations.json явно фиксирует доступное наблюдение и это ограничение. Initial build raw и все принятые final logs доступны; окончательные8/744/TS/ESLint/build PASS прочитаны из реальных логов.
