# Собственный trace OSRM — DONE

2026-10-17T17:28:10.010625+03:00. Разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 draft. Source/code head `a49470b7b9ebf4065c44890bc5e516a74dbe0166`; CI39038119987 фактически completed/success. Durable STARTED `dbb5a1ef669e3ce5179d35b59f22378602b766c8`, tree6042eb4100736f0e1989fef87c7cebd0d5781c0f. Точные head/tree/два blob и PR draft проверены readback.

## Причина и результат

После исправления повторного заезда старый Valhalla trace неприменим к выбранному OSRM. Для одного `pair-m11-zsd-prim-to-moscow` восстановлены собственные OSRM metadata из записанного ответа: 715622 м / 30963 с. Valhalla отклонён. BRouter3D не принимается существующим контрактом, а его диагностическая 2D-проекция тоже содержит физический повторный заезд. OSRM выбран по ETA среди допустимых обычных ответов; цена в выборе не участвует.

Единственный новый live map-matching: 6/6 HTTP200, полный trace и booth coverage, failed chunks0. Все точки запросов принадлежат OSRM. Законченный проезд ЗСД: Благодатная → КАД-юг к Пулковскому, точные318102347/375574651 и упорядоченный exit proof. Семь source SHA проверены, включая первичные приказы96/32_1 и правила. Применим существующий готовый вектор зоны1 за300 ₽. Цена600 Екатерингофки и зачёт по чеку другой пары не переносились. Вектор рассчитан по первичным данным; независимого OD-чека нет.

Итог для представителя: **исправлена и проверена** собственная привязка и расчёт компонента ЗСД после замены маршрута. Геометрическое исправление всех шести сохраняет fixed_and_verified; цены остальных пяти новых маршрутов не проверены. Проверен один случай, рассчитаны четыре компонента (ЗСД1/300), подтверждённых полных тарифов0. Составной расчёт5424 на отправление2026-10-15T09:00:00+03:00 имеет priceConfirmation=unconfirmed. Исторический26/50 не является пересчитанным глобальным покрытием новых геометрий.

## Файлы и проверки

[Полный отчёт](../../experiments/nationwide-tolls/checks/2026-10-17-zsd-selected-osrm-trace/README.md), capture.json.gz, selected-route.json.gz, шесть raw requests, STARTED/progress/result/boundary-proof/validation и логи. Скрипты trace-selected-zsd-osrm.mjs и check-selected-zsd-osrm.mjs сохраняют raw и progress, ограничивают сеть trace endpoint /12attempts/120с и блокируют продолжение при terminal error. Offline-mode строго проверяет точные request bodies и результат. Runtime и тарифные векторы не менялись.

Выполнено: два node--check PASS; один offline pricing replay нового capture точно совпал, misses0 и новой сети0; семь source hashes, шесть копий raw responses и собственные route/geometry SHA совпали; пять отрицательных проверок PASS; диагностическая 2D-проекция BRouter подтвердила повторный заезд. Новых routing-запросов0, старых replay74/76/309 нет. Для новых скриптов, по обязательному правилу AGENTS после кода, gate повторён: 721/721, quote/API, TypeScript и Next build16/16 PASS. Точные stdout сохранены gzip без изменения байтов; required-checks.json содержит exit codes и время. Runtime не менялся.

## Сохранение и следующий шаг

Post-STARTED CI39040459995 при готовности случая ещё выполнял необязательную широкую live_probe; обязательный verify completed/success. Операция ЗСД закончена: это ожидание CI. До прекращения активного CI ветку не обновлять. Перед одним итоговым non-force connector commit проверить head/PR/CI, expected parentdbb5a1ef…, затем точные tree/blob/head. Результат не считать сохранённым в remote до переноса. WORK_LOG дополнен, короткие WORK_STATE/NEXT_STEPS и очередь обновлены. Main/merge/Production/Android, сообщений и новых автоматизаций нет.

NEXT после durable DONE и актуального CI: один ограниченный пакет остальных пяти новых OSRM с собственными geometry/metadata/trace. Повторно использовать новый raw только при идентичном request payload, а не общем ПВП. Группа9 и другие непривязанные области сбора остаются BLOCKED; общий поиск тех же тарифов не повторять.

Финальная проверка перед сохранением 2026-10-17T14:36:20.852653+00:00: branch/PR headdbb5a1ef… совпали, PR14 open/draft; CI39040459995 completed/success, verify и live_probe completed/success. Пять последних запусков завершены. Ожидание CI закончилось; разрешена одна итоговая non-force запись с expected parentdbb5a1ef…. Новый post-save CI проверяется отдельно.
