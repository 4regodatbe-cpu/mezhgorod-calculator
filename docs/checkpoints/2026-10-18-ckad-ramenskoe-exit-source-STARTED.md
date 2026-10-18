# ЦКАД Торжок→Раменское: диагностика DONE / exact exit source STARTED

18.10.2026. Source branch/local/PR14 head `ee7d1d4b4887315e9f80263daf3b9aa18bddcb33`, tree `14d61cf58363c386a03019574d33ade03f208c55`, open/draft. CodeCI39132410371 verifyPASS; в начале review live job active, поэтому запись STARTED ждала завершения jobs по WORKFLOW_RULES. Ничего не отменяли и не дублировали.

Короткий offlineразбор own `pair-m11-ckad-torzhok-to-ramenskoe` (captureSHA8fe0ec0a…feeb4d6): frozenvalidation создан до ckadTraceBlocks. Обоснован один ограниченный currentparser replay: 3mockrequests, exactrecordedkeys, misses0, complete3/3. Реальной сети0. Rawне менялся, отобрантотжесобственныймаршрут354824м/13566с. Новыйконтекстсохранён в diagnosis.json; это не повтор309/34/364маршрутныхаудитов.

Original и rebuiltresolver reason одинаковый `ckad_east_arc_not_proven`: это не просто утраченнаяметадата. CKADblockfirst1148492112, beforeM11way1270188034/endnode9556466755 (совпадает сготовымentryproof), lastpaidway886019081/endnode10832306578. Aftercontext: трипоследовательныхedgeчастиway886019063 сendnodes13184575946/13184575942/8914828064, затемA107way119881263/endnode3140785578. Repeatedwaysfalse. Это иной физический выход, чем реализованная параМ11→М12. ГотоваяпараМ11→М4такжене подходит. DefinitionэтихтрёхwaysвretainedCKADsourceотсутствует. НазваниеA107не выбираетячейкуматрицы: внейнесколькоразныхвыходов, включаясеверныйНикольскоеГорки; ценунеугадывать.

STARTED источник: ровно3GET https://api.openstreetmap.org/api/0.6/way/{886019081,886019063,119881263}/full. ≤20s/GET,60s total,body≤1MB,raw/status/SHAсразу после каждого,безповтора. Sourcepath source-snapshots/ckad/2026-10-18-ramenskoe-exit. Цельточныеexitjunction/onewayconnector/A107connection и собственнаянаправленнаягеометрия; деньги/кодневключатьэтимsourcepass. Необращатьсякновомуrouting/traceилиготовымM11источникам.

ПослеsourceDONE: отдельнооценитьдоказаннуюсвязь сoperatorbillingpoint иdirectmatrixcell, использоватьготовыйM11→M12entry/coreproofтольковсовпадающемprefix. Еслиоператорскоеимяне доказано — BLOCKED до конкретногоownerproof и следующийboundedSTARTED; A107/названиегорода/близостьне заменяютнаправленнуюпару. Source3GETне повторять. ДляновогоматчераотдельныйCODE STARTED/focused/fullbuild/APIunknownguards. Main/merge/Production/Androidне менять.


Перед записью: CI39132410371 verify/live_probe оба completed/success, включая geometry/Photon/50settlement/6Yandex. Всеjobs завершены, единственныйwriterсоблюдён. Снимокjobstepsсохранёнвprevious-ci-jobs.json. SourceGET ещёне выполнялись этимSTARTED.
