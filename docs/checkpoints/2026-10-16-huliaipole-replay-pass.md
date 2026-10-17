# Гуляйполе→Москва: новый departure-policy replay PASS

DONE 2026-10-16, parent remote1ab828cf4753013f943c9ee50f4c41cbc3c07eab. Два offline запуска одного исходного live capture c76a9a1ade47e032e1a510fcabed7c762b3cabf691fcf539501272acda2a83ed, 1402530м/66940с, Valhalla. Обе проверки exit0, replayIntegrity.complete=true, missingResponses=[]; тарифная политика trip-departure-v1.

Четверг15.10 09:00+03:00: М4 m4-911→m4-71=3810₽. Суббота17.10 09:00+03:00: та же геометрия/пара=4640₽. Продолжительность18ч35м пересекает полночь: расчёт остаётся по отправлению. Новые JSON с timestamp2026-10-15T21-11-20/21Z в runs/zaporizhzhia-гуляйполе-moscow-center; stdout evidence/2026-10-16-huliaipole-replay.log. Фактическая UTC дата генерации15.10 соответствует16.10 МСК. Это offline replay, не новый live/независимая проверка операторской цены. Старые JSON не заменены.

STARTED следующий маршрут: dnr-бахмут-kazan-center, live departure2026-10-15T09:00:00+03:00, затем same-date и17.10 replay. Существующие corpus spec координаты/политика и routing consent используются; отправляются только маршрутные параметры Valhalla/OSRM/BRouter. Runner run-systemic-route-case.mjs --live dnr-бахмут-kazan-center, stdout evidence/2026-10-16-bakhmut-kazan-live.log. При сбое сохранить failure/raw/progress, не объявлять complete. После live отдельное сохранение перед replay.
