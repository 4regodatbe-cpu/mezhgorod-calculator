# p214 orphan: диагностика DONE / исправление STARTED после сохранения

18.10.2026. Source branch/local/PR14 head `d5d8b37c87be9ea0811298e2496c173cd8581aca`, tree `ff39c5952dd861515b14781f4f01f107e4cf2b17`; PR открыт/draft. Code CI39122753013 verify completed/success (тесты, TS, Next). Live job при начале диагностики active: запись в ветку отложена до завершения всех jobs, согласно WORKFLOW_RULES; не отменять и не запускать дубликат.

Короткий offline-разбор собственного `single-m11-torzhok-to-moscow`: exact booth5286168661/way766468434, roadNames=[] и edgeToll=false, один создаёт `unmapped_selected_route_paid_booth`. Изолированная именованная южная рамка7171624764 классифицируется M11 и orphan не создаёт. Exact5286168661/766468434 совпадает с сохранённой первичной directed-entry.geometry; источник/направленная связь с М11 уже подтверждены, sourceGET не повторяются. `diagnosis.json` содержит captureSHA и per-eventcoverage. Это ошибка идентичности в классификаторе, а не новый платный продукт, ставка или бесплатность.

После durable STARTED/readback выполнить один bounded кодовый блок: экспортировать source-derived exact p214 node/way и классифицировать только эту пару как M11 в unpriced-road-coverage; не применять соседние nodes, другие/missingways, другие безымянные booths или неполныйtrace. Принадлежность дороге не авторизует тариф: отсутствие strictentry/head/dates/chunks должно сохранять неизвестную цену через существующие guards.

Фокус: before unknown orphan / after exacttupleM11, negativeswrongnode/wrongway/missingway/extraorphan/incompletevalidation. Ownquote Thu2380/Sat2890, API price остаётся estimate/unconfirmed, не операторский подтверждённыйODчек. Для head-теста обновить ожидание полногоestimateтолько при missing=[]; controls Раменское/Казань headunknown. Собственный V3API exactrecordedrequest/response replay, безновыхrouting/trace; при отсутствующемtraceAPIamountnull. Лимитfocused60s, fullbuild300s, TS/ESLint/diff; логи/resultвchecks/2026-10-18-m11-p214-orphan. Не повторять364inventory/4готовыхownphysicalchecks/источники.

При остановке дробить только остаток, исходные результаты не пересчитывать при сбое сохранения. После полного локальногоgate — один DONE commit/readback и наблюдение новогоcodeCI. Main/merge/Production/Android не затрагивать.


Перед записью: CI39122753013 оба jobs completed/success. Geometry, Photon,50settlement и6Yandexsteps PASS. ПредыдущийlivePhotonfailure39120413592 не стирается; текущая сеть прошла в отдельномrun. Ожидание завершено, ограничения единственногоwriter соблюдены. Jobstep snapshot в previous-ci-jobs.json. Код этой новой причины ещё не менялся.
