# STARTED — Pilot A в отдельной сети GitHub Actions, 24.10.2026 МСК

Parent 2d399b3a952d864dddb9df55a52ee03d02a15b38 / tree d92746d5b0679dcd8f01a33997272f701e7a6ea7, разрешённая fix/v3-missing-route-prices-2026-10-15, PR14 draft. Последние пять Actions completed, active/queued не обнаружены. Локальный parent приведён к connector commit с тем же exact tree; старый local415bfc не новый remote.

Новая независимая сеть: ubuntu-latest GitHub runner вместо container с известным DNS failure. Отдельный workflow geonames-delivery-pilot.yml запускается только изменением своего пути в разрешённой ветке; permissions contents:read, без checkout/credentials/branch writes, concurrency без отмены. Это не повтор маршрутов/обычного PhotonCI.

Лимит: ровно3 исходных HEAD URLs RU.zip/UA.zip/alternateNamesV2.zip; каждый curl max10с/connect6с, max2 HTTPS redirects, без retry/GET/архивов. Job2мин. Результат/progress и headers сохраняются в artifact при always; stdout содержит структурированный result. Только RU/UA status200 + известные положительные размеры суммарно<=50MiB допускают отдельный B-STARTED. Ни успех HEAD, ни размер не разрешают импорт/активацию координат. Runtime/тарифы/маршруты не меняются.

Проверки до сохранения: YAML parse BaseLoader, compile inline Python, mocked subprocess 3 случая (успех/503/нет length), git diff --check; запуск этих проверок и результаты фиксируются в текущем shell output перед commit. Широкий test/build не запускать ради диагностического workflow без изменений кода калькулятора. Actual Actions status не PASS до readback.

Продолжение: после commit/non-force expected_sha/readback прочитать один новый run/jobs/log/artifact, записать A DONE либо BLOCKED. При доступной поставке отдельный B-STARTED до download; при active CI не писать ветку. Production/main/Android/backup не меняются.
