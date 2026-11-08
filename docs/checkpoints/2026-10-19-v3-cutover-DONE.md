# DONE — V3 опубликована основной версией, V2 сохранена как старый алгоритм

Дата: 2026-10-19.

## Решение и объём

Пользователь прямо поручил опубликовать калькулятор с V3 вместо прежней главной версии, сохранив доступную V2 с пометкой «старый алгоритм». Действия ограничены переключением интерфейса/главной страницы и публикацией. Аудитные evidence, тарифная матрица и незакрытые выводы не менялись. PR #14 оставлен open/draft; merge и изменение `main` не выполнялись.

## Результат публикации

- Release commit: `d6fd4c1c7904ea290abb00ce1b777094e5141cff`.
- Release tree: `d8bc523dcd7fd713d15e72204ff3db77e012d0ff`.
- Production deployment: `dpl_8WnsqmTxKKi9GG8qAaAK3tpYFzaA`, состояние READY, исходный commit совпадает с release SHA.
- Оба production alias (`mezhgorod-calculator.vercel.app` и `mezhgorod-calculator-4regodatbe-5310.vercel.app`) указывают на этот deployment.
- Проверены `/`, `/v2`, `/v3`: каждый отвечает HTTP 200; главная и `/v3` показывают активную V3, `/v2` помечена «старый алгоритм».

## Проверки и ограничения

- GitHub Actions run `39287801436`: completed/success; обязательный `verify` завершился успешно.
- Необязательный `live_probe` столкнулся с Photon HTTP 503/timeouts, последующие live corpus шаги были пропущены; job настроен `continue-on-error`. Это не выдаётся за успешный live-probe.
- Локально `pnpm build`: 802 tests passed, 0 failed; quote/API checks passed; `next build --webpack` завершился успешно и обнаружил `/`, `/v2`, `/v3`. Обычный локальный Turbopack build отдельно не разрешил tracked CSS `vendor/shadcn-tailwind-4.13.0.css`; этот локальный сбой сохранён как ограничение. CI Next build для release SHA успешен.
- Перед итоговой документационной записью удалённый ref `fix/v3-missing-route-prices-2026-10-15` прочитан через `git ls-remote` и равнялся `d6fd4c1c7904ea290abb00ce1b777094e5141cff`; workflow для SHA был terminal success, combined Vercel check success. PR #14 подтверждён в списке открытых PR; его draft статус не изменялся.

## Следующий шаг

Продолжать оставшиеся аудитные причины согласно `experiments/nationwide-tolls/NEXT_STEPS.md`. РВП-64 остаётся `unknown`, не 0, пока не появится независимая точная первичная схема/таблица оператора или датированный чек наличной/карточной оплаты. Не менять тарифную матрицу по этому вопросу без такого доказательства.
