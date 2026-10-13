# Nationwide toll-road calculation decisions

## 2026-10-13 — show short A-289 route estimates

User observed no numeric toll estimate on Ялта→Краснодар and Анапа→Краснодар despite stored A-289 prices and requested route estimates to display. V3 may match an actual selected A-289 frame vector to a stored finished OD fare without requiring the unrelated full M-4 corridor: Crimea/Yalta↔Krasnodar all three frames uses accepted 800 ₽; Anapa↔Krasnodar a two-frame vector uses the 833 ₽ Maryanskaya–Varenikovskaya operator candidate as an explicitly unconfirmed Anapa-exit approximation. The full selected route may add a separately matched western bypass once. This provisional junction alias supersedes the earlier rule that Anapa pairs must remain wholly unavailable, but it does not claim an exact Anapa interchange tariff or override other M-4 components. If the crossing vector differs, retain unknown rather than a guessed sum.

## 2026-10-13 — A-289 exits and OD pairs

User requires A-289 as three charged sections plus direct entrance/exit pairs toward Temryuk, Anapa exit, Slavyansk, Krasnodar side and Taman/Crimean-Bridge continuation, in both directions. Preserve direct OD fares; do not derive an unknown Slavyansk→Taman price by subtracting 800 and 620, and do not treat the Anapa exit as Varenikovskaya without junction evidence. The accepted fastest Maryanskaya→Temryuk city trip is 620 ₽, while a full paid traversal toward the bridge is 800 ₽; neither means the archived operator 1,103 ₽ continuous no-transponder row should be charged for these user-defined route scopes. V3 may use a price only after binding the selected route to exact entry/exit and physical frame order, with the city's 620 ₽ bypass requiring its specific route control.

## 2026-10-13 — Crimea full trip has separate toll roads

User's observed Ялта (Крым) → Москва result 5,040 ₽ is incomplete: it covers the M-4 Moscow–Krasnodar corridor alone. On the fastest selected route, add the separately crossed full A-289 bridge-approach vector 800 ₽ and any independently detected Krasnodar bypass toll. The west-bypass amount in the local table is 410 ₽ and remains an unconfirmed estimate pending route/operator comparison; do not infer its traversal from endpoints alone. If A-289 traversal evidence is incomplete, the trip total is unknown rather than the M-4 subtotal. Keep the Donetsk-area Yalta a distinct labeled settlement.

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


## 2026-10-12 — единый нормативный контракт алгоритма

`ALGORITHM_SPEC_2026-10-12.md` становится единым актуальным контрактом песочницы: один минимальный ETA маршрут, только его геометрия, легковой класс I при соответствии, оплата без транспондера/льгот, день и время конкретного тарифного события, unknown при неполном подтверждении, полный вектор ПВП и готовая двусторонняя span-цена М-4 без runtime суммы ПВП. Приоритет над старыми заметками не удаляет историю. Равный ETA требует стабильного tie-break; до реализации этот edge case остаётся открытым.

## 2026-10-12 — каталог объектов и тарифный конфликт

`national-registry.json` сохраняет 22 родительские сети и добавляет 16 дочерних тарифных продуктов Автодора: 10 отдельных участков М-4, 4 продукта М-11 и 2 участка М-3. Это официальный частичный перечень, не доказательство полного реестра по всей РФ. Актуальная таблица Автодора даёт индексируемое содержимое, но прямое открытие вернуло 403; фрагмент не разрешает конфликт с архивным подписанным снимком М-3. Тарифные ячейки не обновлять, пока не извлечены текущий документ, дата действия и колонка Категории I без транспондера.


## 2026-10-12 — пользователь принимает Yandex route fare как подтверждённое значение контрольного прогона

Пользователь указал принимать цену, показанную Яндекс Картами для выбранного самого быстрого маршрута, за истину и использовать как подтверждённые данные калькулятора. Для конкретной пары OD/геометрии, режима легкового авто, даты и времени работы Яндекса это правило применяется и к оценке, визуально помеченной сервисом знаком «~». Каждое такое значение сохраняется как `yandex_user_accepted` с exact маршрутным вектором, периодом и снимочной датой; не смешивать его с официальной тарифной строкой оператора и не распространять на иные OD/вектора без новой проверки.

Зафиксированные M-4 контрольные цены:
- `[1223,1184,1093]`: Mon–Thu 850 RUB; Fri–Sun 1,000 RUB.
- `[1223,1184,1093,1046]`: Mon–Thu 1,230 RUB; Fri–Sun 1,450 RUB.

Источник проверки — fastest route card Яндекс Карт на 2026-10-13 (вторник) и 2026-10-17 (суббота), 12:14, Sochi→Rostov-na-Donu и Sochi→Shakhty. Реестр отдельно указывает, что UI не отображает перечень ПВП: последовательности заданы согласованной пользовательской моделью участка. Применение в коде пока только sandbox; `runtimeEnabled=false`, срок снимка до 2026-10-17. Москва→Краснодар показал наличие платного участка без цены и остаётся unknown.


# Local recovery updates through 13.10.2026

# Действующие решения

13.10.2026: пользователь разрешил текущие кандидатные цены с обязательной пометкой «Стоимость не подтверждена». Это заменяет исключение1820. При наличии кандидата в составе маршрута весь итог и копируемый текст помечаются.

Истёкшие версии вне даты не применяются. Если точного действующего тарифа нет — unknown/null. Произвольная неполная сумма не считается итогом.

Один fastest маршрут, точное доказательство проезда и временного профиля передаются адаптером. Изолированный обработчик не строит маршрут.

13.10.2026: V3 interim numeric toll totals visibly unconfirmed; M4 exact route vectors use the new table, other native components retain their engine while per-road matrix adapters are incomplete. This is an experimental release boundary.

## 2026-10-13 — audit implementation boundary

Existing authorization to display provisional prices remains. A Temryuk city name is not verified bypass evidence: a two-frame estimate uses an explicit provisional permission and unconfirmed output. Complete M4 fares and separately evidenced A289/bypass are composed once for all supported western endpoints. Build runs the expanded audit gate. These are bug fixes under the existing user policy, not new tariff approvals. Open holiday/calendar and missing-network coverage are recorded in AUDIT_2026-10-13.md.

## 2026-10-13 — category-column correction, not a new user tariff policy

User again confirmed whole A289800 and rejected partial Anapa833. Primary indexed operator table shows classI415/205/620/180/800/385; classII555/278/833/270/1103/548 were misread as no-transponder rates. Correct active prices and retain original mistaken raw interpretation in correction metadata. This supersedes assistant explanations about a transponder/scope conflict1103, without changing accepted user800/full and620/two-frame city controls. Operator terminal Temryuk800 and user city-route TemryukCity620 are separate vectors. No payment discount inferred from vehicle category. All interim API estimates continue carrying the approved unconfirmed label.


## 2026-10-13 — stage5 implementation invariants

No new product policy. Apply existing selected-route/direct-versioned-matrix/unknown rules to M11 and CKAD. M11 head/mainline are explicit separate parts; unbound679–684 must block a full-route number. Distinct physical p58 plazas sharing one tariff ID are not a repeated journey; repeat proof attaches to an actual anchor. Native tariff extraction does not authorize unknown route exits. M12 single-span tariff cannot bridge leaving/re-entering the road. Published direct tables alone do not resolve new physical gate coverage.
