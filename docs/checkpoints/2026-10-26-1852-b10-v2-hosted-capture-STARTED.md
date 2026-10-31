# B10 V2 hosted capture — STARTED

- Дата: 26.10.2026 18:52 МСК. Base/allowed branch head: `769d462fe11a07b4ac887ba0b9292dbe0589d320`; PR #14 open, Draft. Main, Android, backup и Production не затрагиваются.
- Условие продолжения: Actions были idle перед записью. Разрешён ровно один сопутствующий `special-territory-policy` run из-за обновления PR; массовый аудит вручную не запускать.
- Исходный Codex capture Ейск→Москва был неполным (HTTP 502, 5 fetch failures, SHA `6cb2a0d8feb1a05877530ccc4a658444cc96559464674df0eafdc9f0cafb2855`). Его путь не перезаписывать.
- Новые полные captures пишутся в отдельный `v2-hosted-<run_id>` через необязательный `V2_ISSUE2_CAPTURE_ROOT`; ограниченный workflow — `.github/workflows/b10-v2-issue2-capture.yml`.

## Ограниченный порядок запуска

Workflow на GitHub-hosted Ubuntu 24 / Node 24 делает ровно по одному bounded GET к Valhalla (`valhalla1.openstreetmap.de/route`), OSRM (`router.project-osrm.org/route/v1/driving`) и BRouter (`brouter.de/brouter`) на координатах Ейск—Москва. Timeout каждого запроса 20 секунд, retries нет. Проверяются HTTP 200 и структура route data; сохраняются URL, статус, конечный URL, тело ответа, SHA-256 и elapsed time. При любом отказе — stop, artifact сохранить, ни один capture не запускать.

При трёх PASS сначала один V2 capture Ейск→Москва. Для полноты должны быть HTTP 200 и валидные raw route bodies: Valhalla×3, OSRM×1, BRouter×1, плюс HTTP 200 полного V2 ответа. Только затем один capture Майкоп→Москва с теми же критериями. При частичном/ошибочном ответе — BLOCKED, не сравнивать и не продолжать на Майкоп.

При двух полных captures выполняются только offline replay каждого на четверг `2026-10-22T09:00:00+03:00` и субботу `2026-10-24T09:00:00+03:00`; проверяются 0 live requests, 0 replay misses, 0 unused responses. Выход сравнивается с ранее сохранёнными V3 capture/replay. Unknown/null не трактовать как ноль; результаты — сравнение project proxy controls, не подтверждение тарифа.

Обновление ожидает readback после завершения workflow: stdout/manifest, HTTP-коды, полный capture, per-response hashes, summary и comparison в artifact. Если push-trigger не создаст узкий run, не повторять commit/запрос: сохранить workflow и сообщить точный минимальный запуск через GitHub Actions UI.
