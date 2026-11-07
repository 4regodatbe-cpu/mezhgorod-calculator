# DONE — публикация исправления поиска адресов, 20.10.2026

## Авторизация и выпуск

Пользователь прямо поручил «Публикуй с исправлением». STARTED checkpoint сохранён коммитом e47ec8f8c0760bc0f28720d48216bc8763a79bb6; readback PR #14 подтвердил его head. Создан отдельный Production deployment dpl_DGhwwdXRTKwbbEMR127M5AbDMAoP из точного проверенного source 4b647bfe01c903352f3842072ceafb23ea6d10a2. Vercel READY; target=production; aliasError=null. Оба основных alias mezhgorod-calculator.vercel.app и mezhgorod-calculator-4regodatbe-5310.vercel.app через get_alias подтверждены за этим deployment. PR #14 остался open/draft; merge и изменение main не выполнялись.

## Фактические проверки

Production build: 810 tests / 810 pass / 0 fail; quote/API contracts PASS; Next compiled successfully; static generation 16/16; Build Completed. Production GET / вернул HTTP200 и метку актуального калькулятора. GET /v2 — HTTP200 и «старый алгоритм». GET /api/suggest для «Ростов», «Красн», «Моск», «Краснодар» — каждый HTTP200, 20 подсказок; для «Ростов» среди первых трёх есть «Ростов-на-Дону».

Скан error runtime logs нового deployment за последние 5 минут: No logs found. Это ограниченный скан, не доказательство отсутствия всех ошибок. Полный интерактивный сценарий A→B и live POST /r в этом выпуске не проверены; authenticated connector выполняет только GET, существующего authenticated Vercel CLI в среде нет. Не считать GET проверкой UI. Прокси abort propagation ранее покрыт focused regression (43/43).

Опубликованы ранее проверенные изменения timeout/abort, общего LRU cache и региона адресных handlers. Тарифная матрица и аудит в этом выпуске не редактировались. Evidence: 2026-10-20-address-search-production-evidence.json. Следующий шаг — при повторном отказе UI сопоставить точный запрос и время с POST /r; не повторять полный тарифный аудит.
