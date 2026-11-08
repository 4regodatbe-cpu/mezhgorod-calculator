# STARTED — диагностический тариф М1/М3 по отправлению

Источник369df969ab363ccada5e6af17c70997108c497ef/tree69b5dab0d520b10f14968eb4cafaa19a13d1ac88, PR14draft, разрешённая ветка. Предыдущий М4sourcepass завершён и8pathSHA/headreadback проверены.

По savedM3 provenance обнаружен отдельный codebug: m1-m3-shadow-quote.mjs считает дату конца поездки и отказывается отcross-midnight, вопреки правилу пользователя15.10.2026 изDECISIONS.md. Только diagnostic shadow дляМ1/М3; customerunknown остаётся связан с независимымиproof/source gates. Провереннаяdatehorizon2026-10-10 не расширяется. Точные входы/проверки/восстановление: experiments/nationwide-tolls/checks/2026-10-18-m1-m3-departure-policy/inputs.json.

После durable STARTED: изменить только enddate-проверку, regression cases; focused/fullaudit/tsc/eslint/build сtimeout120с накоманду и per-check progress/log. Финальный codecommit безskipci. Если остановка — продолжить с готовыхchecks, не повторять маршруты.
