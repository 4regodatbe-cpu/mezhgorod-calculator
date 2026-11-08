# Полный gate: первоначальная проверка 653/656

FAILED 2026-10-15T21:54:19.172032+03:00, parent remote cb64897ddd2c74a99ad9aff73e9d3f0994e9282c. pnpm build exit1: audit656tests,653PASS/3FAIL; quote/API/Next/TypeScript/static не дошли дозапуска. Сохранён полный stdout docs/checkpoints/evidence/2026-10-15-departure-policy-build.log. TargetedESLint13изменённыхsource/testфайлов exit0, stdout docs/checkpoints/evidence/2026-10-15-departure-policy-eslint.log. ПолныйbuildPASS не заявляется.

ПричинытрёхFAIL: scripts/v3-road-availability-audit.test.ts всёещёожидаетnull припересечениинеделиМ11; scripts/v3-southern-products.test.ts ожидаетnull длячетверг→пятницаДЗОК; scripts/v3-time-calendar-audit.test.ts ожидаетnull длячетверг→пятницаМ4. Эти ожидания superseded прямымновымправилом пользователя. Последний тест также проверяетNumber.MAX_VALUEduration; проверкуневалиднойдлительностинадосохранить независимоотфиксированноготарифа (вновомhelperнетстарогопредохранителяoverflow).

NEXT: обновить эти3группыожиданий согласно правилуотправления, вернутьguardнепредставимойдлительности, добавить regression startdatevsfuturepayment/validity. Затем focused и повторfullgate сдругимлогом, сохранитьрезультатдоreplay. Runtimeматрицы/Production/Androidне менялись. Аудит8/155.
