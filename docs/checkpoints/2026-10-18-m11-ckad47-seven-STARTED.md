# STARTED — семь оставшихся М11 head cases

МСК 2026-10-18T12:32:21.990710+03:00. Source code `29129946ed7445677332749857f89efbc9ff546b`; CI39115104478 **completed/success**, оба jobsverify/live_probecompleted/success. Remote/PRhead повторносовпал,PR14draft;разрешённаяветка `fix/v3-missing-route-prices-2026-10-15`.

Цель: проверить применение уже сохранённой севернойпривязкиЦКАД47→М11 ксеми оставшимся собственнымcapture. ПервыйпредставительАрзамас→Приморскийнеповторяется. Входы7точныхGitblob/path,6code/dataSHA и14datedпрофилей в `experiments/nationwide-tolls/checks/2026-10-18-m11-ckad47-seven/inputs.json`.

Лимит:7cases,2датыкаждый,60секработы; новыхсети/routing/trace/sourceGET/fullpricingreplay0. Проверяется собственныйrawGitblobSHA,полнотаvalidation,exactgate/paidcontinuation/38pointcorridor/7orderedanchors,strictmainline58→679 иготоваяheadпара. Длякаждого3negativeguards:reverse/incomplete/absentgate. Полныеитогипоездок ипрочиедорогивэтомблокенепересчитываются.

Runner `experiments/nationwide-tolls/checks/2026-10-18-m11-ckad47-seven/check-head.mjs` сохраняеткаждыйрезультат иprogressатомарно. ПрипрерыванииDONEпереиспользоватьтолькоприinput/runner/runtimefingerprint+blobсовпадении;иначестоп. Любоеотличиефактическихданныхсчитатьmaterialexception,неослаблятьguard. Заодинпакетодинитоговыйcommit/readback;поштучныхCIнебудет. Runtimeнеменяется,fullgateповторне нужен;проверкиrunner syntax/JSON/hash/diffдостаточныдляsource-onlyпакета.

ПослеdurableSTARTEDreadbackвыполнитьодинrunnerзапуск,прочитатькаждыйcaseиитог,сохранитьDONE/ошибкуиобновитьочередь. БлокиЗСД/ЦКАД/М12необъявлятьзакрытыми. Никакихавтоматизаций,merge/main/Production/Android.
