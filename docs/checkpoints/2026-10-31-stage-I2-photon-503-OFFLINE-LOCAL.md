# Stage I2 — Photon 503 разобран, внешний отказ не объявлен исправленным

31.10.2026, source/parent `72ba7bbfc56b5c5bcaeccd2ce73b0b634ce795a4`. Только локально, PR №14 не менялся, push запрещён.

- [Доказательства и ограничения](../../experiments/address-search/stage-i-2026-10-31/PHOTON_503.md): CI run 41198667966, Донецк 4×503 + 3×cooldown, ноль features / 274 мс, не budget timeout. Семь URL — один origin. Код pool/collector/fetch/ranking проверен точечно, не повторён общий аудит.
- Четыре новых детерминированных теста в `scripts/address-503-regression.test.ts`: совпадение observed counts, освобождение очереди, cross-query cooldown и восстановление, сохранение частичного успеха. `node --import ./scripts/register-ts-paths.mjs --test scripts/address-503-regression.test.ts`: **4 PASS, 0 FAIL, exit 0**. Все провайдеры контролируемые, реальных новых запросов этот блок не делал.
- Новый реальный capture Донецка из I1 возвращает оба ID и правильный приоритет, но не доказывает устойчивость. Причина формирования удалённого HTTP 503 остаётся **BLOCKED_EXTERNAL_SOURCE**: нет per-variant headers/body/backend logs. Runtime не меняли ради обхода отказа.
- Добавлено актуальное описание нового snapshot в ADDRESS_CITY_SNAPSHOT.md. Исторические доказательства не редактировались.
- Следующее: обязательный финальный offline gate, последовательные TypeScript/линтер/build; сохранить exit codes и проверку bundle. Новые Actions, публикация, live-аудит, Production не разрешены.
- Сохранение — локальный commit + файловый readback; GitHub остаётся на ранее опубликованном SHA, новые PASS CI не заявляются.
