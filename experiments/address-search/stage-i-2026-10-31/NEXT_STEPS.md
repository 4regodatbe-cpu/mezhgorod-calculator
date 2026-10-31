# Stage I — следующие действия, только локально

## I3 snapshot-trigger — финальное дополнение, 31.10.2026

Исправление filters DONE LOCAL: `data/address-city-snapshot.json` отслеживается независимо на push и PR. Target 5/5 PASS; offline 1063 PASS / 1 SKIP; TypeScript/ESLint/Next build exit 0. Предыдущий snapshot/review/история сохранены; freshness/SHA256/browser guards не менялись. Точные логи и исходники — `checks/i3-snapshot-trigger/RESULTS.json`, отдельный DONE checkpoint. Следующий шаг — только отдельно разрешённый remote preflight и публикация с проверкой настоящих Actions/Preview. Сейчас push запрещён; новый bundle не подменяет GitHub persistence. Photon503 повторно не исследовать без новых данных. Ниже — сохранённое состояние предшествующего блока.

## Текущее состояние после финальных проверок

- I1 DONE LOCAL: новый реальный snapshot и provenance, дата-блокировка B03 устранена. Runtime flag OFF, expiry 07.11.2026 17:50:17.541 МСК. Повторять capture без новой причины не нужно.
- I2 DIAGNOSED / BLOCKED_EXTERNAL_SOURCE: HTTP 503 и origin cooldown разделены, четыре новые offline-регрессии PASS. Сам удалённый отказ не исправлен; см. PHOTON_503.md. Нужны upstream/edge logs либо отдельно разрешённая узкая инструментированная проверка, не массовый audit.
- I3 DONE LOCAL: 1061 offline PASS / 1 SKIP, quote/API PASS, TypeScript/ESLint/build exit 0. Логи и сводка checks/RESULTS.json.
- Следующее действие владельца — отдельное разрешение на публикацию, если требуется новый B03 Actions/Preview. В текущем задании push запрещён; старое Preview не подтверждает новый локальный код. Финальный commit/readback/bundle выполняются без публикации. Исторический checklist ниже оставлен как журнал уже выполненного.

Актуально после I1 review: пункты 1–2 ниже завершены. Новый snapshot допущен по четырём новым реальным ответам/ID, срок ограничен 07.11.2026 17:50:17.541 МСК. Далее пункты 3–4. Не повторять capture и не запускать CI/браузер в неизменной среде.

1. Один bounded follow-up точных названий двух недостающих городов (`capture-snapshot.mjs <SHA> --exact-missing`). Старый неудачный prefix capture не затирать, повтор в неизменной среде запрещён.
2. Только при полном новом наборе: review четырёх исходных ID, подписей, координат, SHA/provenance; новый snapshot максимум на семь суток от самого раннего capture. Флаг OFF, старые доказательства сохранить. При недостатке данных — B03 BLOCKED, срок не продлевать.
3. Независимый offline-разбор Photon 503/cooldown по сохранённому CI и контролируемым сценариям. Не увеличивать бюджет, не выключать circuit breaker ради зелёного CI. Новых live-аудитов не запускать.
4. Целевые проверки, необходимые обязательные gates; checkpoint, локальный commit/readback/bundle. Без push, Production и повторного браузерного запуска в неизменной sandbox-среде.
