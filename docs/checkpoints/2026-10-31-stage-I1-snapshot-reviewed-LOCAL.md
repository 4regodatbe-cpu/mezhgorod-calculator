# Stage I1 — новый snapshot допущен, только локально

31.10.2026, 17:54 МСК. Parent `da0e545c5ec2038097230b7dc77723897af006ad`, линия разрешённой ветки. Второй push не разрешён.

После сохранённого неполного prefix capture выполнен один follow-up **точных** названий: Краснодар HTTP 200 / 1864 мс, Ростов-на-Дону HTTP 200 / 916 мс, exit 0. Первоначальный prefix capture и все старые источники сохранены. Всего четыре пользовательских запроса, без широкого аудита. Это direct local handler + реальный Photon, не Preview и не моки.

Review: все четыре исходных OSM ID, подписи, регионы и координаты нового набора полностью совпали с ранее проверенными. Оба Донецка сохранены раздельно, ДНР первый. Partial-флаг/отказы отдельных запросов не скрыты; это допуск только четырёх фактически полученных положительных записей, не всей выдачи и не общей доступности Photon. Новые raw JSON, HTTP-коды, capture times, source commits и SHA — рядом с `capture-review*.json`.

Обновлён `data/address-city-snapshot.json`: новый ID, реальные capture/provenance, records SHA `c72b3e2bf9be57e774a245c2f10ff6f69dd4d043258579dff60e46da65afa0a4`. Срок до **07.11.2026 17:50:17.541 МСК**, ровно семь суток от самого раннего нового capture. Это не продление старого снимка изменением даты. Флаг OFF, runtime/CI/политика freshness не менялись. Добавлена проверка совпадения даты source и сохранённого capture.

Проверено: snapshot contracts + B03 workflow contracts, 9 PASS / 0 FAIL, exit 0 (до дополнительного timestamp assertion); точная текущая freshness-команда workflow exit 0. После assertion целевой запуск повторяется; полный offline gate и build — следующий обязательный блок. Логи вне repo: `/workspace/stage-I-handoff-ZWSMDm/`. Браузер/Actions не перезапускались; новый PASS 18 сценариев не заявляется. Snapshot снимает лишь установленную блокировку pre-browser.

Следующее: offline-воспроизведение Photon 503/cooldown на сохранённых наблюдениях; затем необходимые финальные проверки. Только локальный commit/readback/bundle, без Production/main/Android/backup/тарифов.
