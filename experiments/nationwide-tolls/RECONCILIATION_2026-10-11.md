# Toll source consistency audit — 2026-10-11; tariff section reconciled 2026-10-13

> **Tariff resolution (2026-10-13):** the 800-vs-520 mismatch was caused by a stale M3 snapshot that read higher vehicle classes as payment modes. Category-I direct rates and the 2026-03-02 operator full-road benchmark agree on 480 ₽ Mon–Thu / 520 ₽ Fri–Sun. M1 detailed tariff distinguishes 230 ₽ with transponder and 250 ₽ without; no-transponder registry is now 250 ₽. See `M1_M3_TARIFF_REAUDIT_2026-10-13.md`. Route-matching and complete-trip limitations below still apply.

## Findings

1. national-registry.json snapshot asOf 2026-10-10 lists M3 rows: 65-86 =100, 112-150=190, 150-194=190 Mon-Thu /230 Fri-Sun. Sum on Friday =520 RUB, not 800 RUB.
2. M1_M3_EVIDENCE_2026-10-09.md describes a distinct source-day 2026-10-09 M3 shadow 200+320+280=800 RUB from data/tolls/2026-10-01-avtodor-other-roads-category1.json. These are different snapshots and values. No conclusion can be drawn about which applies without primary operator version and exact charge semantics. Never combine either set into customer money.
3. M1 mainline km46 and Odintsovo bypass local km4.6 are different operator charging systems. See M1_OPERATOR_SCOPE_AUDIT_2026-10-11.md.

## Required release gate

- Explicit tariff effective-from and valid-through evidence; operator category/payment/direction; exact selected-route PVP/entry-exit mapping; full operator receipt; regression in both directions.
- Until independently reconciled: UNKNOWN, not zero or 520/800, and no production cutover.

## Work status

Documentation/source consistency inspection only. No Node tests, Next build, Valhalla live route, browser E2E, deployment or operator receipt verification performed. Next: obtain operator dated primary tariff and same-route M1 physical evidence.


## 2026-10-11 — Yandex Maps directional control routes (browser observation)

Yandex Maps route planner was inspected interactively in the connected browser; displayed tariff values are approximate estimates for passenger cars under 2 m, without a transponder, at estimated time of passing. Yandex says the values come from toll-road operators and vary by arrival time on flexible tariffs (https://yandex.ru/company/news/01-19-10-2023; https://yandex.ru/support/maps/ru/concept/rout-options).

### M3 control: Kaluga ↔ Moscow, selected alternative
- Калуга → Москва, selected third route: **~290 RUB**, 3 h 11 min / 117 mi. Directions show M3/Kievskoe highway before exiting toward Минское шоссе; therefore excludes the M1 mainline/Odintsovo bypass. Deep details say ~290 RUB, under-2m/no-transponder estimate. Browser URL observed: https://yandex.com/maps/?ll=36.930627%2C55.141148&mode=routes&rtd=2&rtext=54.513678%2C36.261341~55.755819%2C37.617644&rtn=2&rtt=auto&ruri=~ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgg1MzA1Njk0MBIa0KDQvtGB0YHQuNGPLCDQmtCw0LvRg9Cz0LAiCg2eCxFCFQEOWkI%2C~ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgg1MzE2NjM5MxIa0KDQvtGB0YHQuNGPLCDQnNC-0YHQutCy0LAiCg14eBZCFfUFX0I%2C&z=9
- Москва → Калуга, selected third route: **~290 RUB**, 2 h 41 min / 115 mi. It follows Kievskoe highway/M3 and then R-132; same estimate profile. Browser URL observed: https://yandex.com/maps/213/moscow/?ll=37.616982%2C55.756334&mode=routes&rtext=55.755819%2C37.617644~54.513678%2C36.261341&rtt=auto&ruri=ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgg1MzE2NjM5MxIa0KDQvtGB0YHQuNGPLCDQnNC-0YHQutCy0LAiCg14eBZCFfUFX0I%2C~ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgg1MzA1Njk0MBIa0KDQvtGB0YHQuNGPLCDQmtCw0LvRg9Cz0LAiCg2eCxFCFQEOWkI%2C&z=9
- **Interpretation:** the two directions agree on Yandex's selected-route estimate for those endpoints and selected alternatives. This does NOT resolve the old 800-vs-520 snapshot conflict: exact toll gates charged on each route and applicability of each table row have not been matched. Treat ~290 as a route-level external benchmark only, not a newly certified M3 PVP sum.

### M1 control: Odintsovo → Golitsyno
- Yandex route **33 min / 15.9 mi, ~50 RUB**, route details include exit to M-1 then rejoin Можайское шоссе, and under-2m/no-transponder estimate. Thus the short selected route appears to charge a segment/corridor passage, not necessarily the whole 33-66 km tariff.
- Official sources identify M-1 paid segment km33–66 and a toll plaza at km46: https://avtodor-tr.ru/road/m-1/ and https://avtodor-tpass.ru/page/punkty-vzimaniya-platy-i-tsentry-podderzhki. Operator's tariff search snapshot lists category I as 230 RUB with T-pass / 250 RUB without transponder for full 33-66 km (https://avtodor-tr.ru/road/tariffs/). The search-rendered tariff table is an indexed snapshot; direct site fetch returned HTTP 403, so current effective date and precise applicability for the observed short route remain unverified.
- **Interpretation:** do not hardcode 50 RUB as a full M-1 tariff. The route may be using an M-1 partial segment or another nearby charge; selected-route physical PVP match is still needed.

## Verification performed for this entry
- Read-only Yandex Maps route-plan observations in browser; no account, location, payment or data submission. Search result/open of official Avtodor tariff sources; page open was HTTP 403 but indexed excerpts were available.
- No repository code changed. No unit test/build/deployment was run in this research-only addition.

## 2026-10-11 — дополнительные Yandex route controls и дальние контрольные образцы

Проверены выбранные автомобильные маршруты в Yandex Maps. Сумма в карточке маршрута приблизительная, для автомобиля ниже 2 м без транспондера, на расчётное время проезда платного участка. Это независимый маршрутный ориентир, а не чек оператора и не точная тарифная матрица.

| Контроль | Наблюдение в Yandex Maps | Что проверяет / ограничение |
|---|---|---|
| Казань → Набережные Челны | выбранный быстрый вариант 2 ч 49 мин, около **90 ₽**; детали включают Вознесенский тракт, М-12 и М-7 | маршрутный платеж есть; сумма зависит от выбранного коридора |
| альтернативный Казань → Набережные Челны | 3 ч 05 мин, около **278 ₽**; иной вариант маршрута через М-7/М-12 | расхождение **188 ₽** между альтернативами — контроль для сопоставления точной геометрии/въездов, не повод усреднять или переносить тариф |
| Санкт-Петербург → Кронштадт | быстрый вариант 52 мин, около **600 ₽**, детали показывают ЗСД и КАД | контроль полного городского участка |
| альтернатива Санкт-Петербург → Кронштадт | 1 ч 09 мин, около **300 ₽**, также ЗСД и КАД | вероятно иная длина/схема проезда по ЗСД; нужны точные въезд/съезд и направление |
| Санкт-Петербург → Москва | 6 ч 58 мин, около **6 150 ₽**, в деталях виден ЗСД; дальний многосистемный контроль | сумма всего маршрута, нельзя считать тарифом только М-11; сегментация по системам не завершена |
| Москва → Казань | 8 ч 11 мин, около **5 250 ₽** | дальний контроль для коридора с участками М-12; точное распределение по операторам и въездам не подтверждено |
| Москва → Краснодар | 15 ч 44 мин / около 840 mi, около **5 530 ₽** | дальний контроль М-4, один выбранный вариант |
| Краснодар → Москва | 15 ч 49 мин / около 840 mi, около **5 260 ₽** | обратная оценка на другом расчётном времени/варианте; отличие **270 ₽** следует перепроверить по одинаковой дате/времени проезда и проходам, не считать доказанной тарифной асимметрией |
| Краснодар → «площадь Советов» (карта разрешила пункт назначения так) | 2 ч 21 мин / около 104 mi, платный участок около **620 ₽**; альтернатива 2 ч 46 мин / 103 mi без показанной суммы | НЕ классифицировать как A-289: геокодер подменил запрошенный пункт на «площадь Советов», точная трасса не зафиксирована |

Наблюдения по карточкам маршрута делались в интерфейсе Яндекс Карт 2026-10-11. Контроль A-289 считается **неуспешно разрешённым запросом**, сумма 620 ₽ не относится к доказанной A-289. Расстояния оставлены в единицах, как их показал интерфейс (mi).

### Выводы и границы проверки

- Варианты Казань—Набережные Челны и СПб—Кронштадт показывают, почему сравнивать тариф надо на конкретном выбранном маршруте: альтернативы имеют заметно разные суммы.
- Дальние маршруты М4, М11-коридора, М12 и комбинированный СПб—Москва добавлены как контрольные образцы. Они проверяют суммарный результат маршрутизатора, но не дают независимого точного разложения по каждому ПВП/оператору.
- Данные Яндекса не закрывают все 22 семейства реестра. Особенно открыты точные проезды/ставки для ZSD, SHMSD/Vitebsk, Mytishchi, Pskov, Khabarovsk, Ryazan, regional bridges и Odintsovo bypass. Без подходящих endpoint routes и доказанной геометрии их статус остается unknown.
- Не переносить маршрутные оценки в live billing и не менять тарифы только на основании расхождений между альтернативами/направлениями. Следующий корректный шаг для каждого расхождения: закрепить оба конца маршрута, дату/время, выбранную альтернативу, полный список платных въездов/съездов и сравнить с операторским калькулятором/чеком и действующей версией тарифа.

### Проверка этой записи

Read-only проверка UI Яндекс Карт; без входа в аккаунт, оплаты или отправки данных. Для неудачно разрешённого маршрута Краснодар—Анапа сохранить URL наблюдения как отрицательное свидетельство: https://yandex.com/maps/?ll=38.146836%2C45.055112&mode=routes&rtext=45.035470%2C38.975313~44.895077%2C37.316315&rtt=auto&ruri=~&z=9. Репозиторий: только документация; тесты/build/deploy не запускались в этом исследовательском блоке.
