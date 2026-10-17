# Рабочие зависимости восстановлены — DONE

Статус: DONE, 16.10.2026 18:43 МСК. Ветка `fix/v3-missing-route-prices-2026-10-15`, draft PR 14; исходный remote/head `8943f3c3b1db1900e6eaf93652916141f670bfe5`, tree `2fa822dc806ce3a2061104465c7b077a4ada2c32`.

После очистки временной среды создан отдельный checkout `calculator-run` на точном remote head. Выполнено `pnpm install --frozen-lockfile`: exit 0, lockfile признан актуальным, supply-chain policy проверила 504 записи, установлено 429 пакетов. Исходники и lockfile не изменились; это восстановление среды, а не новая проверка тарифа или runtime-логики.

Следующий шаг: `node experiments/nationwide-tolls/scripts/review-zsd-finding-case.mjs --next` для `max-chain-m12-ckad-m11-zsd-sest-to-vladimir`, затем отдельные commit/publish/head/tree readback. Общий прогресс остаётся 90% = 18/20 полностью завершённых частей; ZSD review остаётся 54/76; подтверждённость тарифов этим шагом не менялась.
