# DONE — оставшиеся13ZSDboundarychecks

# ЗСД: оставшиеся13 собственных boundary exception checks

18.10.2026. После7завершённыхchecks группы1e954 проверены13явноuncheckedsiblings трёх других ранее оценённыхscopegroups. Представители не пересчитывались. По каждому провереныfrozenreportSHA,captureSHA,точное совпадениеownselectedproviderresponsegeometry с выбраннойroutegeometry,полнотаtrace/boothcoverage,порядокПВПвrawtrace иownentry/exit.

| Группа | Новыеchecks | С готовымпредставителем | Физическое различие |
|---|---:|---:|---|
|3493, КАД-юг→КАД-север,OSRM|4|5/5|Другая севернаяполоса1766158809|
|3404, КАД-север→КАД-юг,OSRM|3|4/4|Северныйвъезд5745105499|
|2c00, Макарова/Шкиперский→КАД-юг,Valhalla|6|7/7|Рамка13020687195/way351741889 иПВП933975069|

УOSRM собственныевходные/выходныеmaneuvers включаякоординаты совпали ссоответствующимпредставителем; утретьейгруппы собственныйtrace содержитточнуюрамку,аинструкции —съездкКАД/Пулковскому. Rawboothorder иwaysets совпали вкаждойгруппе. Error0, finalmaterialexceptions0. Пакет0.615с; сети/providercalls/pricingcalls/fullroute replay0. Вэтойсессии20новыхsiblingboundarychecks(7+13), неповтор74pricingchecks.

**Уточнениерамки2c00:** первичнаяодноразоваясверка ошибочнотребовалаtoll=true наapproachedge. Это вызвало6ложныхпредварительныхотличий. Вretainedrepresentative икаждомсобственномcapture фактическиtoll=false приnode.type=toll_gantry,way351741889. Исправлено сравнениесфактамипредставителябезповторногопарсингаcapture: идентичностьрамкиподтверждена, но необходимость/размеротдельнойплаты неподтверждены. Исходные6выводов иinitialsummary сохраненывinitial-gantry-toll-assumption/, correction —comparison-correction.json. Ниtoll=false,нитипрамки неозначаютдоказаннуюбесплатность/плату.

**Итог:** все3группы остаютсяblocked_by_missing_reliable_data: нетнаправленногоoperatorcash/card collectionbundle иготовоготарифноговектора дляточныхграниц; у2c00 отдельнонуженохватвъезднойрамки. Новыхpricedcomponents/confirmedfullfares0, runtime/матрицане менялись. Исторические26priced/50unknown несчиталисьзаново. Теперьнеосталосьявноunchecked sibling boundary cases вdirectedGroupReviews; это завершениеэтойсверки, неготовностьтарифовиливсегокалькулятора.

Missingworkingtreecaptures восстановлены толькоизсуществующихlocalGitblobs сGIT_NO_LAZY_FETCH=1. Проверены13reportSHA/13captureSHA/GitblobSHA; JSON/diff/progress. Fulltests/build не требовались дляevidence-only ине запускались. ПоследнийcodeCI39101746826 completed/success относитсяк65bed1ae…; онневыдаётсяза новуюпроверкуэтихданных.

STARTEDd28d6629…/tree06f5a119…,17path/head/PR14draft readbackPASS. Методselectedgeometry/trace следуетexistingreview-zsd-remaining-scopes.py; trace-outputshapeindices не используютсядляselectedinputcoordinates.

NEXT: нерасширятьrouteaudit. Следующийнезависимыйпробел —operatorrule/datedreceipt по въездуМакарова/Шкиперскийчерезрамку13020687195 ивыходуКАД-югчерез933975069. Передновымsourcepass boundedSTARTED сточнымnewsource; общие300₽/зона,наличиерамкиилиtolltag не выбиратькакцену. М3date/M4physical545 удерживатьBLOCKEDбезновогонезависимогоисточника.

Сохранение: одинитоговыйcommit/exacttree/path/headreadback дляпакета,PR14draft. main/merge/Production/Androidбезизменений.
