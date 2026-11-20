# RC1 — реальная HTTP-приёмка PASS LOCAL

31.10.2026, source `63fd9ee5fbda27ef42164a3379b9ed53de2127e0`. App/lib/data равны проверенной I3 сборке; localhost, GeoNames local test ON, snapshot OFF, без Production/Vercel изменений.

`node --import ./scripts/register-ts-paths.mjs experiments/release-candidate-1/2026-10-31/api-flow.mjs http://127.0.0.1:3027 <sourceSHA>`: **exit 0 / PASS**. 11 реальных HTTP POST /r обслужены реальным GeoNames-корпусом, Photon fetch намеренно запрещён только в local test process; счётчик Photon attempts **0**. Оба Донецка раздельно, ДНР первый; явная Ростовская область приоритетна; Волноваха/Ялта/Луганск/Мариуполь/Краснодар/Москва/СПб/Анапа — положительные результаты с валидными координатами. API responses не моки. Контролируемый outage не называется реальным отказом удалённого Photon.

V3 и прежний V2 HTTP SSR 200, в V3 GeoNames attribution и поля A/B; это не browser hydration. Некорректный пользовательский тариф отклонён 400 до маршрутизации.

Один реальный HTTP V3 Краснодар→Анапа: **200 / 2280.669 мс**, 166347 м / 8713 с, schema valid, положительные тарифные суммы всех четырёх классов. Standard transfer 4159 ₽ при 25 ₽/км, toll 620 ₽ / priced. Есть реальные Valhalla/OSRM/BRouter timing spans, маршрут выбран действующим алгоритмом. Это новый ограниченный end-to-end HTTP результат, не массовый аудит и не независимая сертификация тарифа/10-секундный SLA. Полный response/server timing/capture time — live-krasnodar-anapa.json, все городские raw responses — api-flow.json в experiments/release-candidate-1/2026-10-31/checks/.

Проверки interactive A/B/реверса/mobile остаются отдельной browser границей. Helper UID65534/root mismatch не исправлялся обходом sandbox; она не помечена PASS. Следующее — сохранённые актуальные replay/компонентные UI/race/двойные тарифные проверки, минимальные P0/P1 fixes если воспроизводятся, затем финальные gates и сводный release report. Только local commit/readback/bundle; без push.
