## CURRENT 2026-10-11 — профиль Яндекс-проверки и V3 fast-only Preview

- **ПРАВИЛО ПРОФИЛЯ ЗАКРЕПЛЕНО:** день недели/дата и ожидаемое время проезда; легковой автомобиль (категория I там, где совпадает с правилами оператора); основной тариф без транспондера и льгот; только заезд/съезд/направление выбранной быстрой геометрии Яндекса. Пользователю — единственный самый быстрый маршрут, без альтернатив. Подробности: `experiments/nationwide-tolls/DECISIONS.md`, журнал: `WORK_LOG.md`.
- **КОД FAST-ONLY РЕАЛИЗОВАН В ИЗОЛИРОВАННОМ V3 PREVIEW:** selector/UI выбирают и показывают один маршрут, тарификация вызывается по выбранному пути; V2 и Production остаются отдельными. Preview `https://mezhgorod-calculator-53y0sp8p5-4regodatbe-5310.vercel.app/v3`; deployment `dpl_27xe2AARTyLMRZswQBxdKoGvGPQF`, код SHA `62192398f343fcbf4a3c47f32c9585762c28839c`, READY; сборка скомпилирована, статические страницы 16/16. Страница отвечает HTTP 200.
- **ОТКРЫТЫЙ ТЕХНИЧЕСКИЙ РИСК:** `lib/v2-calculation/route-leg.ts` может связать выбранную Valhalla-кандидатную геометрию с доказательством основной Valhalla-геометрии. Исправить ссылку на evidence к выбранному route object, затем прогнать живые контрольные маршруты по одному и убедиться, что единственный выбранный путь, toll validation, M4/M11/M12/national coverage и выдача имеют ту же геометрию. Новый кодовый коммит пока не внесён.
- **ЦЕНЫ НЕ ЗАКРЫТЫ:** Yandex amounts остаются наблюдениями для того же профиля/геометрии, когда API показывает оценку. Чтобы утверждать операторский точный тариф, сопоставить ту же дату/время, класс I, без транспондера, направление и точные въезды/съезды с действующей официальной строкой тарифа/калькулятором или чеком. Разногласия и неизвестные сети перечислены в `experiments/nationwide-tolls/RECONCILIATION_2026-10-11.md`; не переносить оценку на другой маршрут и не помечать unknown как 0.
- **Последняя запись правила:** решение commit `bf2427651e24e64f3ef51e4f834cbccf9176fa00`, work log commit `58c537d4d79eaceaf9a9f68288586500cfad1328`. Preview/Production не продвигался на Production.
- **NEXT:** внести и проверить привязку evidence к выбранной геометрии в доступной рабочей копии; проверить endpoint тестами; пройти спорные и дальние OD по указанному профилю Яндекса и закрыть operator tariff matches; затем выполнить полный Preview E2E и принять решение о выпуске.

---

## CURRENT 2026-10-11 — Yandex route checks expanded

- **DONE — read-only route controls:** Yandex checks now include disputed alternatives Казань—Набережные Челны (~90/278 ₽) and СПб—Кронштадт (~600/300 ₽), plus long controls СПб—Москва (~6 150 ₽), Москва—Казань (~5 250 ₽), Москва↔Краснодар (~5 530/~5 260 ₽). Older M1/M3 checks remain documented. Exact observations, limitations and failed A-289 endpoint resolution are in `experiments/nationwide-tolls/RECONCILIATION_2026-10-11.md`.
- **INTERPRETATION:** these are route estimates for passenger car <2 m/no transponder; they do not certify per-gate tariffs or operator receipts. Route alternatives/direction deltas are unresolved checks, not billing corrections. A-289 not confirmed by the malformed endpoint. No all-network coverage claim.
- **DONE — docs persisted:** reconciliation appended and work log updated; latest audit commit `79b86c99654d072597c438e7027f4037cfb6ca47` (includes reconciliation, work log, next-step priority and this handoff). No code/tariff change. No tests/build/deploy run (docs-only research). Existing branch Preview remains on earlier source SHA; production untouched.
- **NEXT:** resolve each materially divergent route against exact selected geometry, dated operator tariffs and matching official trip calculator/receipt; expand targeted Yandex checks for open network groups listed in `NEXT_STEPS.md`. Never convert estimates directly to live prices.

---

## CURRENT 2026-10-11 — Yandex Maps fare controls observed