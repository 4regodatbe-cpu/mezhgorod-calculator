# Nationwide toll-road calculation decisions

## 2026-10-09 — user mandate
User instructed: cover **all other Russian toll roads**, not M-4 only. Existing M11/M12/CKAD/A289 engines remain authoritative as currently implemented; national coverage extension must not regress them or claim completion when only catalogued.

## 2026-10-09 — safety, pricing semantics, scope
1. Separate **road network inventory**, **official selected tariff row**, **route-level evidence** and **money actually applied**. One must not imply the next.
2. Vehicle operator class I (physical dimension/axles) is distinct from passenger transfer tariff "Standard/Comfort/Comfort+".
3. Operator billing differs fundamentally by network: flat single camera, physical gate, entry/exit OD, time/day/holiday, distance, special transit, overlapping toll systems, and operator payment product. Never force one fixed RUB/km model.
4. Unknown paid component => **whole route toll amount unknown, not 0 and not partially priced**. Even an empty paid event list does not certify free without independent route validation.
5. Refuse charging an operator tariff without selected-route full coverage and exact verified facility identity. Input from this offline core is not public user-controlled data. No integration of mocked proof to actual customer invoice.
6. Current reference 8 operator fare networks are **operator published snapshots**, not end-to-end route tariff guarantees. For sources without a known start date, quote only the 2026-10-09 audit date; for future dates after snapshot, return unknown. No transponder discount unless mode supported with versioned source.
7. M4 PVP first/last + every intermediate + mixed-state rules remain separately experimental, 0 official matched full corridor monetary rows. Do not disturb that branch's work history.
8. All next changes must be documented in Git according to `AGENTS.md`; Preview only until proved ready and explicitly release-authorized.

## 2026-10-09 — first bidirectional exact physical M3 PVPs; diagnostic 800RUB only

- Map matching selected-route Valhalla `edge.toll=true` with a concrete OSM toll booth node is admissible **physical passage proof** only if separately cross-checked against OSM API `barrier=toll_booth`, exact official operator kilometer/name, and same-route consistency. Six M3 names/IDs pass, M1 remains unverified.
- A **three-gate M3 sample amount** derived from time-limited 2026-10-09 published category-I/no-transponder source rows can appear **only as shadow**; it is **not** automatically included in actual transfer pricing. Real current operator tariff effective date, full corridor bill, mixed multi-road total and any extra ramps require stronger proof.
- Keep cost unknown instead of adopting an unverified 800RUB live value, even when 3/3 physical booths found. Source-proven gate identity and validated complete operator fare are distinct.


## 2026-10-11 — новый калькулятор показывает только самый быстрый маршрут

Пользовательское продуктовое правило для новой версии калькулятора:

1. Маршрутизатор выбирает **ровно один маршрут с минимальным временем в пути** среди найденных допустимых автомобильных маршрутов.
2. Калькулятор показывает пользователю только этот маршрут; альтернативные варианты маршрута не показываются.
3. Платность проверяется на выбранной геометрии: если на самом быстром маршруте нет платных участков, показываем его как бесплатный; если платные участки есть, учитываем платный маршрут и его плату. Бесплатная альтернатива не подменяет более быстрый платный маршрут.
4. Тарифная проверка относится к выбранным въездам/съездам и направлению этого единственного маршрута. Нельзя суммировать цены альтернатив или переносить цену другого маршрута.
5. Если платность, состав участка или сумма выбранного маршрута не подтверждены, сохраняется fail-closed состояние (unknown по действующим правилам), а не бесплатная метка и не частичный итог.

**Область действия:** решение задаёт поведение новой версии/нового route pipeline. Само по себе оно не переключает и не меняет текущий production алгоритм, route selector, тарифные таблицы или UI. Наблюдавшиеся в Яндекс Картах альтернативы (~90/278 ₽ для Казань—Набережные Челны; ~600/300 ₽ для СПб—Кронштадт) теперь следует использовать только как диагностические свидетельства для проверки того, что калькулятор выбирает самый быстрый маршрут и оценивает именно его; пользователю альтернативы не выводить.

**Проверка перед внедрением:** регрессия выбора минимального времени (в том числе, когда кратчайший по времени вариант платный, а медленный бесплатный); проверка тарифа строго по геометрии выбранного варианта; равное время/детерминированный tie-break; недоступные/неполные тарифные сведения не превращаются в «бесплатно». Источник — прямое продуктовое указание пользователя от 2026-10-11.


## 2026-10-11 — обязательный профиль контрольной проверки Яндекс.Карт

Для контрольной проверки выбранного быстрейшего маршрута в калькуляторе применяется следующий единый профиль:

1. Учитывать день недели поездки; для тарифов с временной/дневной сеткой использовать именно календарную дату и ожидаемое время прохождения платного участка.
2. Категория автомобиля — легковой автомобиль, категория I оператора там, где она соответствует габаритам/осям и официальной классификации.
3. Способ оплаты — основной тариф без транспондера. Транспондерные скидки и специальные льготы не применять.
4. Проверять ровно самый быстрый маршрут, выбранный Яндекс.Картами на момент сверки. Заезд и съезд, направление и последовательность платных сегментов берутся из этой же выбранной геометрии; суммы альтернатив не сравниваются для расчёта и не смешиваются.
5. В калькуляторе пользователю показывается только один fastest-by-time маршрут. Если подтверждённых платных участков на нём нет — он бесплатный; если платные участки есть — учитывается этот маршрут и применимый к выбранным въездам/съездам тариф. Более медленный бесплатный путь не подменяет быстрый платный.

Этот профиль задаёт условия проверки и не означает, что оценки Яндекса являются операторским чеком или опубликованной официальной тарифной матрицей. Если Яндекс показывает только ориентировочную сумму, фиксировать её как наблюдение для того же маршрута/даты, а окончательный денежный тариф определять по подходящему операторскому тарифу с теми же въездом, съездом, направлением, категорией и способом оплаты. Если эквивалентность полного маршрута или тарифа не установлена, не объявлять значение точным и не подменять его нулём.
