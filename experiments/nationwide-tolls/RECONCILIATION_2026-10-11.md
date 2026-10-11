# Toll source consistency audit — 2026-10-11

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
