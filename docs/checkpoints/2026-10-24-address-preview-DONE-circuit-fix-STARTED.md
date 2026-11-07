# DONE live smoke / STARTED исправления cooldown — 24.10.2026 МСК

Parent a7ae6aa8ea2c312e55da060637e32c232f606db0/treefb1ca9b6c8c9537f29c482729cdb989f1bafe321 подтверждён remote/tree до smoke. Проверялся существующий automatic Preview dpl_3oCZcqnjbj8BKWtbzDN7YvcT9VXx на source849102c5994c16db2dbfe1ca8d1c145b856725ea. PR14draft, Production не менялась. Выполнены ровно3 последовательных GET, без повторов. Лимит STARTED соблюдён.

## Факты live smoke

Ответы сохранены сразу: checks/2026-10-24-address-live/preview-{rostov,krasn,donetsk}.json. Safe headers и API bodies сохранены без share/bypass tokens/cookies. Ростов HTTP200, Ростов-на-Дону третьим, tool elapsed7498мс; Красн HTTP200, Краснодар первым,2449мс; Донецк HTTP502,2884мс. Tool elapsed включает транспорт Vercelconnector и не равен чистому server времени. POST/r/browser/phone этим live шагом не проверялись.

Read-only runtime logs того же deployment (projectprj_JbuIKFQNjD3FvAcX2I65Dm5OBKie/teamUFuw0UGXjMqBV2hJBxsWGAMS) объяснили502:Ростов server578мс/7sources/1http503; Красн server159мс/7sources/1http503; Донецк server16мс/7source_cooldown/budgetExpiredfalse. Полный выбранныйlog без querytext/tokens: runtime-logs.txt. Значит новая глобальнаяoriginpause после одного503 мешает следующему адресу при частично работоспособном сервисе. Это реальная воспроизведённая регрессия нового pool, а не доказанная исходная причина всех старыхB-onlyсбоев. Причина внешнего503 отдельно неизвестна.

## Следующий блок STARTED — приоритетное исправление

Изменить lib/photon-request-pool.ts:503/429 cooldown только после3 отказов подряд без успешного ответа в коротком15сокне; успешный upstream200 сбрасывает failure state и cooldown. Cachehit сам по себе не выдавать за новое доказательство здоровья. Concurrency2/queue64/cache/singleflight/abort и общий20сbudget сохранить. Тест на partial503→новыйcoldaddress обязателен. Существующий endpoint test, который ожидал502послеpartial503, должен быть исправлен: он закреплял невернуюпродуктовуюлогику. Для полногоoutage добавить отдельныйсценарийсерийных503, которыйпо-прежнему502/cooldown, безfalseempty.

Focused/fullgate/ESLint/build, sourceevidence и checkpoint/readback обязательны. Если исправление не удастся — отключитьaddressRequestPoolswitch и зафиксировать причину, не оставлять известнуюрегрессиювключённой. Не снижатьguards/неудалятьassertionsрадиPASS: расширить partial и полныйoutageконтракты отдельно.

Следующий независимый блок после этого — ранее запланированный actualruntimeCIprobe3queries/≤60с. Старыйprobe остаётсяhistorical. Дальнейший bounded live retry тольконаготовомновомexactPreview с отдельнымSTARTED, не повторятьтристарыхqueryбезновогокода. Документарноепромежуточное сохранение skipci, финальныйкодCIобычный. Нет Production/main/merge/тарифныхизменений.
